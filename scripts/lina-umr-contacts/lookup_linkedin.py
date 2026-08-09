from __future__ import annotations

import json
import re
import time
import urllib.parse
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

from models import Contact
from utils import LINKEDIN_RE, normalize_space

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }
)

INSTITUTE_ALIASES = {
    "curie": "Institut Curie",
    "imrb": "IMRB",
    "gustaveroussy": "Gustave Roussy",
    "institutcochin": "Institut Cochin",
    "crcordeliers": "Cordeliers",
    "irsl": "IRSL",
    "inserm": "Inserm",
    "pasteur": "Institut Pasteur",
    "u-paris": "Université Paris Cité",
    "univ-paris13": "Sorbonne Paris Nord",
}


def company_for_contact(contact: Contact) -> str:
    unite = (contact.nom_unite or "").lower()
    for key, label in INSTITUTE_ALIASES.items():
        if key in unite.lower():
            return label
    if contact.umr and contact.umr != "—":
        return f"Inserm U{contact.umr}"
    return contact.nom_unite or "Inserm"


def search_linkedin(
    prenom: str,
    nom: str,
    company: str,
    delay: float = 4.0,
) -> tuple[str, str]:
    """Return (linkedin_url, confidence)."""
    full_name = normalize_space(f"{prenom} {nom}")
    if not full_name or len(full_name) < 4:
        return "", ""

    queries = [
        f"site:linkedin.com/in {full_name} {company}",
        f"site:linkedin.com/in {full_name} Inserm",
        f"site:linkedin.com/in {nom} {company}",
    ]

    for q in queries:
        url = "https://search.brave.com/search?" + urllib.parse.urlencode({"q": q})
        try:
            time.sleep(delay)
            resp = SESSION.get(url, timeout=20)
            if resp.status_code >= 400:
                continue
            for match in LINKEDIN_RE.findall(resp.text):
                href = match.split("?")[0].rstrip("/")
                if "/company/" in href.lower():
                    continue
                conf = "medium"
                slug = href.rsplit("/", 1)[-1].lower()
                if nom.lower().replace(" ", "-") in slug:
                    conf = "high"
                return href, conf
        except requests.RequestException:
            continue
    return "", ""


def enrich_contacts_linkedin(
    contacts: list[Contact],
    checkpoint_path: Path,
    max_lookups: Optional[int] = None,
) -> list[Contact]:
    checkpoint: dict = {}
    if checkpoint_path.exists():
        checkpoint = json.loads(checkpoint_path.read_text())

    lookups = 0
    for c in contacts:
        if c.linkedin_url:
            continue
        key = c.dedup_key()
        if key in checkpoint:
            cached = checkpoint[key]
            c.linkedin_url = cached.get("url", "")
            c.linkedin_source = "search" if c.linkedin_url else ""
            c.linkedin_confidence = cached.get("confidence", "")
            continue
        if max_lookups is not None and lookups >= max_lookups:
            break
        company = company_for_contact(c)
        url, conf = search_linkedin(c.prenom, c.nom, company)
        checkpoint[key] = {"url": url, "confidence": conf}
        if url:
            c.linkedin_url = url
            c.linkedin_source = "search"
            c.linkedin_confidence = conf
        lookups += 1
        if lookups % 25 == 0:
            checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2))

    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2))
    return contacts
