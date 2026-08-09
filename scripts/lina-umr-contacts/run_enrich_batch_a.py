#!/usr/bin/env python3
"""Enrichit les 68 premiers contacts tier A via recherche web."""
from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import EMAIL_RE, LINKEDIN_RE, extract_emails, extract_linkedin_urls, normalize_space, slugify_name

ROOT = Path(__file__).resolve().parents[2]
QUEUE_PATH = ROOT / "data" / "checkpoints" / "enrich-queue.json"
OUT_PATH = ROOT / "data" / "checkpoints" / "enrich-batch-a.json"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    }
)

GENERIC_PREFIX = ("contact@", "info@", "secretariat@", "accueil@", "webmaster@", "admin@")
PERSONAL_DOMAINS = ("@inserm.fr", "@curie.fr", "@cnrs.fr", "@u-pec.fr")
LAB_KEYWORDS = {
    "Immunité et Cancer": ("curie", "institut curie", "immunité", "cancer", "inserm", "932"),
    "IMRB": ("imrb", "mondor", "créteil", "955", "inserm"),
    "CESP": ("cesp", "villejuif", "inserm", "1018"),
}

SEARCH_ENGINES = [
    "https://search.brave.com/search?",
    "https://html.duckduckgo.com/html/?",
]


def norm(s: str) -> str:
    return (s or "").strip().lower()


def strip_accents(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    return "".join(c for c in text if not unicodedata.combining(c))


def is_personal_email(email: str, prenom: str, nom: str) -> bool:
    email = norm(email)
    if not email or any(email.startswith(g) for g in GENERIC_PREFIX):
        return False
    if not any(email.endswith(d) for d in PERSONAL_DOMAINS):
        return False
    local = email.split("@")[0]
  # prenom.nom pattern preferred
    p_slug = slugify_name(prenom.split()[0] if prenom else "")
    n_slug = slugify_name(nom)
    if p_slug and n_slug and (f"{p_slug}.{n_slug}" in local or f"{p_slug}-{n_slug}" in local):
        return True
    if n_slug and n_slug in local.replace(".", "-").replace("_", "-"):
        return True
    return bool(re.match(r"^[a-z][a-z0-9._\-]{2,}$", local))


def linkedin_valid(url: str, prenom: str, nom: str, lab: str) -> tuple[bool, str]:
    if not url or "/company/" in url.lower():
        return False, ""
    slug = url.rsplit("/", 1)[-1].lower()
    nom_slug = slugify_name(nom)
    prenom_slug = slugify_name(prenom.split()[0] if prenom else "")
    if nom_slug and nom_slug in slug:
        conf = "high" if prenom_slug and prenom_slug in slug else "medium"
        return True, conf
    return False, ""


def linkedin_title_valid(html: str, prenom: str, nom: str, lab: str) -> tuple[bool, str]:
    text = strip_accents(html.lower())
    full = strip_accents(normalize_space(f"{prenom} {nom}").lower())
    name_ok = all(part in text for part in full.split() if len(part) > 2)
    if not name_ok:
        return False, ""
    keywords = LAB_KEYWORDS.get(lab, ("inserm", "curie", "cnrs"))
    if any(k in text for k in keywords):
        return True, "medium"
    return False, ""


def web_search(query: str, delay: float = 2.5) -> str:
    for base in SEARCH_ENGINES:
        url = base + urllib.parse.urlencode({"q": query})
        try:
            time.sleep(delay)
            resp = SESSION.get(url, timeout=25)
            if resp.status_code == 429:
                time.sleep(12)
                continue
            if resp.status_code >= 400:
                continue
            return resp.text
        except requests.RequestException:
            continue
    return ""


def search_linkedin(prenom: str, nom: str, lab: str) -> tuple[str, str]:
    full = normalize_space(f"{prenom} {nom}")
    queries = [
        f"{full} {lab} site:linkedin.com/in",
        f"site:linkedin.com/in {full} {lab}",
        f"site:linkedin.com/in {full} Inserm",
        f"site:linkedin.com/in {nom} {lab}",
    ]
    best_url, best_conf = "", ""
    for q in queries:
        html = web_search(q)
        if not html:
            continue
        links = extract_linkedin_urls(html)
        if "duckduckgo" in q or True:
            soup = BeautifulSoup(html, "lxml")
            for a in soup.select("a[href]"):
                href = a.get("href", "")
                if "uddg=" in href:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                    href = parsed.get("uddg", [href])[0]
                links.extend(extract_linkedin_urls(href))
        for href in dict.fromkeys(links):
            href = href.split("?")[0].rstrip("/")
            ok, conf = linkedin_valid(href, prenom, nom, lab)
            if ok:
                if conf == "high":
                    return href, conf
                if not best_url or (conf == "medium" and best_conf != "high"):
                    best_url, best_conf = href, conf
            elif not ok:
                # check title in snippet
                idx = html.lower().find(href.lower())
                snippet = html[max(0, idx - 200) : idx + 400] if idx >= 0 else html[:800]
                tok, conf = linkedin_title_valid(snippet, prenom, nom, lab)
                if tok and (not best_url or conf == "medium"):
                    best_url, best_conf = href, conf
    return best_url, best_conf


def search_email(prenom: str, nom: str) -> str:
    full = normalize_space(f"{prenom} {nom}")
    queries = [
        f'{full} email inserm OR curie.fr OR cnrs.fr',
        f'{full} "@curie.fr" OR "@inserm.fr"',
        f'{nom} {prenom.split()[0] if prenom else ""} @inserm.fr',
    ]
    for q in queries:
        html = web_search(q, delay=2.0)
        if not html:
            continue
        emails = EMAIL_RE.findall(html)
        for e in emails:
            e = e.lower()
            if is_personal_email(e, prenom, nom):
                return e
    return ""


def try_curie_page(prenom: str, nom: str) -> tuple[str, str, str]:
    slug = slugify_name(f"{prenom}-{nom}")
    url = f"https://curie.fr/personne/{slug}"
    try:
        time.sleep(1.0)
        resp = SESSION.get(url, timeout=20)
        if resp.status_code != 200:
            return "", "", ""
        soup = BeautifulSoup(resp.text, "lxml")
        title = soup.title.string if soup.title else ""
        if nom.lower() not in (title or "").lower():
            return "", "", ""
        email = ""
        for e in extract_emails(soup):
            if is_personal_email(e, prenom, nom):
                email = e
                break
        li = ""
        conf = ""
        for u in extract_linkedin_urls(soup):
            ok, c = linkedin_valid(u, prenom, nom, "Immunité et Cancer")
            if ok:
                li, conf = u.split("?")[0].rstrip("/"), c
                break
        return li, conf, email
    except requests.RequestException:
        return "", "", ""


def enrich_contact(c: dict) -> dict:
    prenom, nom, lab = c["prenom"], c["nom"], c["lab"]
    hit: dict = {"prenom": prenom, "nom": nom}
    url, conf, email = "", "", ""

    if lab in ("Immunité et Cancer",) or "curie" in lab.lower():
        li_c, conf_c, em_c = try_curie_page(prenom, nom)
        if li_c:
            url, conf = li_c, conf_c or "high"
        if em_c:
            email = em_c

    if c.get("need_li") and not url:
        url, conf = search_linkedin(prenom, nom, lab)

    if c.get("need_em") and not email and not url:
        email = search_email(prenom, nom)

    if url:
        hit["url"] = url
        hit["confidence"] = conf or "medium"
    if email:
        hit["email"] = email
    return hit


def main() -> None:
    queue = json.loads(QUEUE_PATH.read_text())
    tier_a = [c for c in queue if c.get("tier") == "A"][:68]
    targets = [c for c in tier_a if c.get("need_li") or c.get("need_em")]

    results: list[dict] = []
    if OUT_PATH.exists():
        results = json.loads(OUT_PATH.read_text())

    done = {(norm(r["prenom"]), norm(r["nom"])) for r in results}
    print(f"Targets: {len(targets)}, already done: {len(done)}")

    for i, c in enumerate(targets):
        key = (norm(c["prenom"]), norm(c["nom"]))
        if key in done:
            continue
        print(f"[{i+1}/{len(targets)}] {c['prenom']} {c['nom']} …", flush=True)
        hit = enrich_contact(c)
        if hit.get("url") or hit.get("email"):
            results.append(hit)
            print(f"  -> LI={hit.get('url','')} EM={hit.get('email','')}", flush=True)
        else:
            print("  -> rien", flush=True)
        OUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        done.add(key)

    print(f"\nSaved {len(results)} hits to {OUT_PATH}")


if __name__ == "__main__":
    main()
