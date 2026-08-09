#!/usr/bin/env python3
"""Enrichissement massif : scrape sites + recherche LinkedIn (Bing)."""
from __future__ import annotations

import argparse
import base64
import csv
import json
import re
import sys
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))

from clean_and_enrich import linkedin_matches_contact
from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report
from utils import extract_emails, extract_linkedin_urls

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "lina-umr-contacts.csv"
CKPT_PATH = ROOT / "data" / "checkpoints" / "lina-umr-enrich-all.json"

ALLOWED_EMAIL_DOMAINS = (
    "@inserm.fr",
    "@curie.fr",
    "@cnrs.fr",
    "@u-pec.fr",
    "@u-paris.fr",
    "@aphp.fr",
    "@pasteur.fr",
    "@gustaveroussy.fr",
    "@igr.fr",
    "@univ-paris",
    "@sorbonne",
)
GENERIC_PREFIX = ("contact@", "info@", "secretariat@", "accueil@", "webmaster@", "institutmondor@")

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "fr-FR,fr;q=0.9",
    }
)


def load_contacts() -> list[Contact]:
    contacts: list[Contact] = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))
    return contacts


def merge_contact(dst: Contact, src: Contact) -> None:
    if src.email and not dst.email:
        dst.email = src.email
    if src.linkedin_url and not dst.linkedin_url:
        dst.linkedin_url = src.linkedin_url
        dst.linkedin_source = src.linkedin_source
        dst.linkedin_confidence = src.linkedin_confidence


def save_contacts_merged(local: list[Contact]) -> None:
    by_key = {c.dedup_key(): c for c in local}
    merged = load_contacts()
    for c in merged:
        if c.dedup_key() in by_key:
            merge_contact(c, by_key[c.dedup_key()])
    write_csv(CSV_PATH, merged)


def load_ckpt() -> dict:
    if CKPT_PATH.exists():
        return json.loads(CKPT_PATH.read_text())
    return {"urls_done": [], "search_done": []}


def save_ckpt(ckpt: dict) -> None:
    CKPT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = load_ckpt()
    merged = {
        "urls_done": sorted(set(existing.get("urls_done", [])) | set(ckpt.get("urls_done", []))),
        "search_done": sorted(set(existing.get("search_done", [])) | set(ckpt.get("search_done", []))),
    }
    CKPT_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2))


def pick_email(emails: list[str]) -> str:
    personal = []
    for e in emails:
        el = e.lower().strip()
        if not any(d in el for d in ALLOWED_EMAIL_DOMAINS):
            continue
        if any(el.startswith(g) for g in GENERIC_PREFIX):
            continue
        personal.append(el)
    return personal[0] if personal else ""


def decode_obfuscated(html: str) -> list[str]:
    found: list[str] = []
    for token in re.findall(r"[A-Za-z0-9+/]{16,}={0,2}", html):
        for candidate in (token, token[::-1]):
            try:
                raw = base64.b64decode(candidate + "=" * ((4 - len(candidate) % 4) % 4))
                text = raw.decode("utf-8", errors="ignore")
                if "@" in text and "." in text.split("@")[-1]:
                    found.append(text.lower())
            except Exception:
                pass
    return found


def fetch_page(url: str, delay: float = 0.4) -> str:
    time.sleep(delay)
    try:
        r = SESSION.get(url, timeout=20, allow_redirects=True)
        if r.status_code >= 400:
            return ""
        return r.text
    except requests.RequestException:
        return ""


def scrape_url(url: str) -> dict:
    html = fetch_page(url)
    if not html:
        return {"email": "", "linkedin": ""}
    soup = BeautifulSoup(html, "lxml")
    emails = extract_emails(soup) + decode_obfuscated(html)
    email = pick_email(emails)
    links = extract_linkedin_urls(html)
    linkedin = ""
    if links:
        linkedin = links[0].split("?")[0].rstrip("/")
    return {"email": email, "linkedin": linkedin}


def company_query(c: Contact) -> str:
    u = (c.nom_unite or "").lower()
    for key in ("curie", "imrb", "cesp", "gustave", "cochin", "pasteur", "inserm"):
        if key in u:
            return key.title() if key != "imrb" else "IMRB"
    if c.umr and c.umr != "—":
        return f"Inserm U{c.umr}"
    return (c.nom_unite or "Inserm").split("—")[0].split("(")[0].strip()[:40]


def search_linkedin_bing(prenom: str, nom: str, company: str, delay: float = 1.2) -> tuple[str, str]:
    full = f"{prenom} {nom}".strip()
    if len(full) < 4:
        return "", ""
    q = f"site:linkedin.com/in {full} {company}"
    url = "https://www.bing.com/search?" + urllib.parse.urlencode({"q": q})
    time.sleep(delay)
    try:
        r = SESSION.get(url, timeout=25)
        if r.status_code >= 400:
            return "", ""
        links = extract_linkedin_urls(r.text)
        nom_slug = nom.lower().replace(" ", "-")
        prenom_slug = prenom.lower().split()[0] if prenom else ""
        best, conf = "", ""
        for href in links:
            href = href.split("?")[0].rstrip("/")
            slug = href.rsplit("/", 1)[-1].lower()
            c = "low"
            if nom_slug and nom_slug in slug:
                c = "medium"
            if prenom_slug and prenom_slug in slug and nom_slug in slug:
                c = "high"
            elif prenom_slug and len(prenom_slug) > 2 and prenom_slug in slug:
                c = "medium"
            if c == "high":
                return href, c
            if not best or (c == "medium" and conf == "low"):
                best, conf = href, c
        return best, conf or "low"
    except requests.RequestException:
        return "", ""


def coverage(contacts: list[Contact]) -> dict:
    n = len(contacts)
    has = sum(1 for c in contacts if c.linkedin_url or c.email)
    return {
        "total": n,
        "with_contact": has,
        "pct": round(100 * has / max(n, 1), 1),
        "linkedin": sum(1 for c in contacts if c.linkedin_url),
        "email": sum(1 for c in contacts if c.email),
    }


def run_scrape(contacts: list[Contact], ckpt: dict, max_urls: int | None = None) -> None:
    done = set(ckpt.get("urls_done", []))
    by_url: dict[str, list[Contact]] = {}
    for c in contacts:
        url = (c.source_url or "").strip()
        if not url or url in done or url.endswith("/annuaire/"):
            continue
        if c.email and c.linkedin_url:
            continue
        by_url.setdefault(url, []).append(c)

    n = 0
    for url, group in by_url.items():
        data = scrape_url(url)
        for c in group:
            if data["email"] and not c.email:
                c.email = data["email"]
            if data["linkedin"] and not c.linkedin_url:
                if "curie.fr/personne/" in url or linkedin_matches_contact(
                    data["linkedin"], c.prenom, c.nom
                ):
                    c.linkedin_url = data["linkedin"]
                    c.linkedin_source = "site"
                    c.linkedin_confidence = "high"
        done.add(url)
        n += 1
        if n % 25 == 0:
            ckpt["urls_done"] = sorted(done)
            save_ckpt(ckpt)
            save_contacts_merged(contacts)
            stats = coverage(contacts)
            print(f"  scrape {n} urls | coverage {stats['pct']}% ({stats['with_contact']}/{stats['total']})")
        if max_urls is not None and n >= max_urls:
            break
    ckpt["urls_done"] = sorted(done)


def run_search(contacts: list[Contact], ckpt: dict, max_lookups: int | None = None, delay: float = 1.2) -> None:
    done = set(ckpt.get("search_done", []))
    lookups = 0
    for c in contacts:
        if c.linkedin_url:
            continue
        key = c.dedup_key()
        if key in done:
            continue
        if not c.prenom or not c.nom or len(c.prenom) < 2 or len(c.nom) < 2:
            done.add(key)
            continue
        if max_lookups is not None and lookups >= max_lookups:
            break
        company = company_query(c)
        url, conf = search_linkedin_bing(c.prenom, c.nom, company, delay=delay)
        if url:
            c.linkedin_url = url
            c.linkedin_source = "search"
            c.linkedin_confidence = conf or "medium"
        done.add(key)
        lookups += 1
        if lookups % 50 == 0:
            ckpt["search_done"] = sorted(done)
            save_ckpt(ckpt)
            save_contacts_merged(contacts)
            stats = coverage(contacts)
            print(f"  search {lookups} | coverage {stats['pct']}% | LI {stats['linkedin']}")
    ckpt["search_done"] = sorted(done)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=["scrape", "search", "all"], default="all")
    parser.add_argument("--max-urls", type=int, default=None)
    parser.add_argument("--max-search", type=int, default=None)
    parser.add_argument("--search-delay", type=float, default=1.0)
    parser.add_argument("--target-pct", type=float, default=90.0)
    args = parser.parse_args()

    contacts: list[Contact] = load_contacts()

    ckpt = load_ckpt()
    stats = coverage(contacts)
    print(f"Start: {stats}")

    if args.phase in ("scrape", "all"):
        print("Phase scrape…")
        run_scrape(contacts, ckpt, max_urls=args.max_urls)

    if args.phase in ("search", "all"):
        print("Phase search LinkedIn…")
        run_search(contacts, ckpt, max_lookups=args.max_search, delay=args.search_delay)

    save_ckpt(ckpt)
    save_contacts_merged(contacts)
    write_report(load_contacts())
    stats = coverage(load_contacts())
    print(f"Done: {stats}")
    if stats["pct"] < args.target_pct:
        print(f"Target {args.target_pct}% not reached — re-run or extend search budget.")


if __name__ == "__main__":
    main()
