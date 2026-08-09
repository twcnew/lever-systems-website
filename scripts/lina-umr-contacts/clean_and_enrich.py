#!/usr/bin/env python3
"""Nettoie le CSV contacts, ré-enrichit emails (sites) et LinkedIn (Brave Search)."""
from __future__ import annotations

import argparse
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

from adapters.curie import fetch_person
from http_client import fetch, fetch_soup
from lookup_linkedin import company_for_contact
from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report
from utils import (
    extract_emails,
    extract_linkedin_urls,
    infer_role_tier,
    normalize_space,
    should_include_role,
    split_name,
)

ROOT = Path(__file__).resolve().parents[2]
IN_CSV = ROOT / "data" / "lina-umr-contacts.csv"
OUT_CSV = ROOT / "data" / "lina-umr-contacts.csv"
CKPT = ROOT / "data" / "checkpoints" / "lina-umr-enrich.json"

JUNK_NAME = re.compile(
    r"publications?|objets?|présentation|ésentation|évention|équipe|equipe|"
    r"programme|patient|projet|structurants?|émérite|venue|ojets?|ojects?|"
    r"ogram|ofesseur|incipales|roits du|éparer|médico|h2020|fp7|twitter|"
    r"contact@|annuaire|lire plus|voir plus|en savoir|cookie|facebook|"
    r"chef de projet|droits du|nom prénom|téléphone|"
    r"référence|plateforme|départment|department|recherche|adjoint|national de",
    re.I,
)
ROLE_LIKE_NAME = re.compile(
    r"directeur|directrice|chef|chercheur|enseignant|professeur|adjoint|"
    r"responsable|coordinateur|coordinatrice|praticien|médecin|ingénieur|"
    r"doctorant|post.?doc|hdr|inserm|cnrs|centre national",
    re.I,
)
NAME_TOKEN = re.compile(r"^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-]+$")
SINGLE_LETTER = re.compile(r"^[A-Z]$")
GRADE_NOM = re.compile(r"^(PU-PH|AHU|MCU-PH|MCF|CR\d|DR\d|HDR|PhD|Doyen)$", re.I)

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


def load_contacts(path: Path) -> list[Contact]:
    contacts: list[Contact] = []
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))
    return contacts


def is_valid_name(prenom: str, nom: str) -> bool:
    p, n = normalize_space(prenom), normalize_space(nom)
    if p.startswith(",") or "," in p and not re.search(r"[A-Za-zÀ-ÿ]{2,}", p.replace(",", "")):
        return False
    if GRADE_NOM.match(n):
        return False
    if "Innovation et" in p and n.lower() == "valorisation":
        return False
    if SINGLE_LETTER.match(n) or SINGLE_LETTER.match(p):
        return False
    if not p and not n:
        return False
    blob = f"{p} {n}".strip()
    if len(blob.replace(" ", "")) < 4:
        return False
    if JUNK_NAME.search(blob):
        return False
    for part in (p, n):
        if not part:
            continue
        if part[0].islower() and part.lower() not in {"de", "van", "von", "le", "la", "du"}:
            return False
        if JUNK_NAME.search(part):
            return False
    tokens = [t for t in (p, n) if t]
    name_words = []
    for t in tokens:
        for w in re.split(r"[\s\-]+", t):
            if w:
                name_words.append(w)
    if not any(NAME_TOKEN.match(w) or w.isupper() for w in name_words):
        return False
    if re.search(r"\d", blob):
        return False
    if "(" in blob or ")" in blob:
        return False
    if ROLE_LIKE_NAME.search(n) and len(n.split()) <= 2:
        return False
    if ROLE_LIKE_NAME.search(p) and len(p.split()) <= 3:
        return False
    return True


def normalize_contact_names(c: Contact) -> Contact:
    p, n = normalize_space(c.prenom), normalize_space(c.nom)
    if p.isupper() and n.isupper():
        p = p.title()
        n = n.title()
    c.prenom, c.nom = p, n
    return c


def fix_curie_person(c: Contact) -> Contact:
    url = c.source_url or ""
    if "curie.fr/personne/" not in url:
        return c
    pdata = fetch_person(url)
    if pdata.get("full_name"):
        c.prenom, c.nom = split_name(pdata["full_name"])
    if pdata.get("role"):
        c.role = pdata["role"]
        c.role_tier = infer_role_tier(c.role)
    if pdata.get("equipe"):
        c.equipe = pdata["equipe"]
    if pdata.get("bio") and len(pdata["bio"]) > 30:
        c.sujet_recherche = pdata["bio"][:500]
    if pdata.get("email"):
        c.email = pdata["email"]
    if pdata.get("linkedin"):
        c.linkedin_url = pdata["linkedin"].split("?")[0].rstrip("/")
        c.linkedin_source = "site"
        c.linkedin_confidence = "high"
    return c


def enrich_from_page(c: Contact, delay: float = 0.8) -> Contact:
    url = (c.source_url or "").strip()
    if not url or url.endswith("/annuaire/"):
        return c
    html = fetch(url, delay=delay)
    if not html:
        return c
    soup = BeautifulSoup(html, "lxml")
    if not c.email:
        emails = extract_emails(soup)
        personal = [
            e
            for e in emails
            if not e.startswith(("contact@", "info@", "secretariat@", "accueil@", "webmaster@"))
        ]
        if personal:
            c.email = personal[0]
        elif emails:
            c.email = emails[0]
    if not c.linkedin_url:
        links = extract_linkedin_urls(soup)
        if links:
            c.linkedin_url = links[0].split("?")[0].rstrip("/")
            c.linkedin_source = "site"
            c.linkedin_confidence = "high"
    return c


def search_linkedin_brave(
    prenom: str,
    nom: str,
    company: str,
    delay: float = 3.0,
) -> tuple[str, str]:
    full_name = normalize_space(f"{prenom} {nom}")
    if not full_name or len(full_name) < 4:
        return "", ""

    queries = [
        f"site:linkedin.com/in {full_name} {company}",
        f"site:linkedin.com/in {full_name} Inserm",
        f"site:linkedin.com/in {nom} {company}",
    ]
    nom_slug = nom.lower().replace(" ", "-")
    prenom_slug = prenom.lower().split()[0] if prenom else ""

    engines = [
        ("https://search.brave.com/search?", {}),
        ("https://html.duckduckgo.com/html/?", {}),
    ]

    for base, _extra in engines:
        for q in queries:
            url = base + urllib.parse.urlencode({"q": q})
            try:
                time.sleep(delay)
                resp = SESSION.get(url, timeout=25)
                if resp.status_code == 429:
                    time.sleep(15)
                    continue
                if resp.status_code >= 400:
                    continue
                links = extract_linkedin_urls(resp.text)
                if not links and "duckduckgo" in base:
                    soup = BeautifulSoup(resp.text, "lxml")
                    for a in soup.select("a.result__a"):
                        href = a.get("href", "")
                        if "uddg=" in href:
                            parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                            href = parsed.get("uddg", [href])[0]
                        links.extend(extract_linkedin_urls(href))
                if not links:
                    continue
                best = ""
                best_conf = ""
                for href in links:
                    href = href.split("?")[0].rstrip("/")
                    slug = href.rsplit("/", 1)[-1].lower()
                    conf = "low"
                    if nom_slug and nom_slug in slug:
                        conf = "medium"
                    if prenom_slug and prenom_slug in slug and nom_slug in slug:
                        conf = "high"
                    elif prenom_slug and prenom_slug in slug:
                        conf = "medium"
                    if conf == "high":
                        return href, conf
                    if not best or (conf == "medium" and best_conf == "low"):
                        best, best_conf = href, conf
                if best:
                    return best, best_conf
            except requests.RequestException:
                continue
    return "", ""


def parse_imrb_annuaire(meta: dict) -> list[Contact]:
    """Re-parse l'annuaire IMRB (lignes courtes uniquement)."""
    soup = fetch_soup("https://imrb.inserm.fr/annuaire/")
    if not soup:
        return []
    contacts: list[Contact] = []
    for tr in soup.find_all("tr"):
        cells = [normalize_space(td.get_text(" ", strip=True)) for td in tr.find_all(["td", "th"])]
        if len(cells) < 5:
            continue
        if cells[0] in list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") and len(cells) > 8:
            continue
        if cells[1].lower() in {"nom", "name", "prénom", "prenom"}:
            continue
        if cells[0] not in ("", "Nom"):
            continue
        nom, prenom, role = cells[1], cells[2], cells[3]
        team = cells[5] if len(cells) > 5 else ""
        if not nom or not prenom or not should_include_role(role):
            continue
        if not is_valid_name(prenom, nom):
            continue
        contacts.append(
            Contact(
                umr=meta.get("umr", "955"),
                nom_unite=meta.get("nom_unite", "IMRB"),
                prenom=prenom,
                nom=nom,
                role=role,
                role_tier=infer_role_tier(role),
                equipe=team,
                sujet_recherche=meta.get("themes", "immunologie;inflammation"),
                ville=meta.get("ville", "Créteil"),
                delegation_inserm=meta.get("delegation_inserm", "est"),
                score_fit_lina=meta.get("score_fit_lina", "10"),
                source_url="https://imrb.inserm.fr/annuaire/",
            )
        )
    return contacts


def dedupe(contacts: list[Contact]) -> list[Contact]:
    seen: dict[str, Contact] = {}
    for c in contacts:
        key = "|".join(
            [
                c.umr.strip().lower(),
                c.prenom.strip().lower(),
                c.nom.strip().lower(),
                c.equipe.strip().lower()[:40],
            ]
        )
        if key not in seen:
            seen[key] = c
            continue
        prev = seen[key]
        for field in ("email", "linkedin_url", "role", "sujet_recherche", "equipe"):
            if not getattr(prev, field) and getattr(c, field):
                setattr(prev, field, getattr(c, field))
        if not prev.linkedin_source and c.linkedin_source:
            prev.linkedin_source = c.linkedin_source
            prev.linkedin_confidence = c.linkedin_confidence
    return list(seen.values())


def clean_contacts(contacts: list[Contact], replace_imrb: bool = True) -> list[Contact]:
    # Retirer entrées IMRB mal parsées
    non_imrb = [
        c
        for c in contacts
        if "imrb.inserm.fr" not in (c.source_url or "")
        or not SINGLE_LETTER.match((c.nom or "").strip())
    ]
    if replace_imrb:
        imrb_meta = {
            "umr": "955",
            "nom_unite": "IMRB — Institut Mondor de Recherche Biomédicale",
            "ville": "Créteil",
            "delegation_inserm": "est",
            "score_fit_lina": "10",
            "themes": "immunologie;inflammation;infectiologie",
        }
        non_imrb = [c for c in non_imrb if "imrb.inserm.fr/annuaire" not in (c.source_url or "")]
        non_imrb.extend(parse_imrb_annuaire(imrb_meta))

    cleaned: list[Contact] = []
    for c in non_imrb:
        c = normalize_contact_names(c)
        if not is_valid_name(c.prenom, c.nom):
            continue
        if c.role and JUNK_NAME.search(c.role) and len(c.role) < 40:
            continue
        cleaned.append(c)
    return dedupe(cleaned)


def purge_shared_linkedin(contacts: list[Contact]) -> None:
    for c in contacts:
        if c.linkedin_url and not linkedin_matches_contact(c.linkedin_url, c.prenom, c.nom):
            if c.linkedin_source == "site" and "curie.fr/personne/" not in (c.source_url or ""):
                c.linkedin_url = ""
                c.linkedin_source = ""
                c.linkedin_confidence = ""


def linkedin_matches_contact(url: str, prenom: str, nom: str) -> bool:
    if not url:
        return False
    slug = url.rsplit("/", 1)[-1].lower()
    nom_slug = nom.lower().replace(" ", "-")
    prenom_slug = prenom.lower().split()[0] if prenom else ""
    if nom_slug and nom_slug in slug:
        return True
    if prenom_slug and len(prenom_slug) > 2 and prenom_slug in slug:
        return True
    return False


def run_site_enrich(contacts: list[Contact], ckpt: dict, max_pages: int | None = None) -> None:
    done_pages: set[str] = set(ckpt.get("site_pages_done", []))
    by_url: dict[str, list[Contact]] = {}
    for c in contacts:
        url = (c.source_url or "").strip()
        if not url or url in done_pages or url.endswith("/annuaire/"):
            continue
        if c.email and c.linkedin_url:
            continue
        by_url.setdefault(url, []).append(c)

    n = 0
    for url, group in by_url.items():
        sample = group[0]
        if "curie.fr/personne/" in url:
            fix_curie_person(sample)
            for c in group:
                if sample.prenom and sample.nom:
                    c.prenom, c.nom = sample.prenom, sample.nom
                if sample.role:
                    c.role, c.role_tier = sample.role, sample.role_tier
                if sample.email:
                    c.email = sample.email
                if sample.linkedin_url:
                    c.linkedin_url = sample.linkedin_url
                    c.linkedin_source = sample.linkedin_source
                    c.linkedin_confidence = sample.linkedin_confidence
        else:
            enrich_from_page(sample)
            for c in group:
                if sample.email and not c.email:
                    c.email = sample.email
                if sample.linkedin_url and not c.linkedin_url:
                    if linkedin_matches_contact(sample.linkedin_url, c.prenom, c.nom):
                        c.linkedin_url = sample.linkedin_url
                        c.linkedin_source = sample.linkedin_source
                        c.linkedin_confidence = sample.linkedin_confidence
        done_pages.add(url)
        n += 1
        if n % 20 == 0:
            ckpt["site_pages_done"] = sorted(done_pages)
            save_ckpt(ckpt)
        if max_pages is not None and n >= max_pages:
            break
    ckpt["site_pages_done"] = sorted(done_pages)


def run_linkedin_enrich(
    contacts: list[Contact],
    ckpt: dict,
    tier: str | None = None,
    max_lookups: int | None = None,
    delay: float = 1.0,
) -> None:
    cache: dict = ckpt.get("linkedin", {})
    lookups = 0
    for c in contacts:
        if c.linkedin_url:
            continue
        if tier and c.role_tier != tier:
            continue
        if not is_valid_name(c.prenom, c.nom):
            continue
        key = c.dedup_key()
        if key in cache:
            hit = cache[key]
            if hit.get("url"):
                c.linkedin_url = hit["url"]
                c.linkedin_source = "search"
                c.linkedin_confidence = hit.get("confidence", "medium")
            continue
        if max_lookups is not None and lookups >= max_lookups:
            break
        company = company_for_contact(c)
        url, conf = search_linkedin_brave(c.prenom, c.nom, company, delay=delay)
        cache[key] = {"url": url, "confidence": conf}
        if url:
            c.linkedin_url = url
            c.linkedin_source = "search"
            c.linkedin_confidence = conf
        lookups += 1
        if lookups % 25 == 0:
            ckpt["linkedin"] = cache
            save_ckpt(ckpt)
            print(f"  LinkedIn lookups: {lookups} (trouvés session: {sum(1 for v in cache.values() if v.get('url'))})")
    ckpt["linkedin"] = cache


def save_ckpt(ckpt: dict) -> None:
    CKPT.parent.mkdir(parents=True, exist_ok=True)
    CKPT.write_text(json.dumps(ckpt, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Nettoie et enrichit lina-umr-contacts.csv")
    parser.add_argument("--skip-clean", action="store_true")
    parser.add_argument("--skip-site", action="store_true")
    parser.add_argument("--skip-linkedin", action="store_true")
    parser.add_argument("--linkedin-tier", choices=["A", "B", "C"], default=None)
    parser.add_argument("--max-site", type=int, default=None)
    parser.add_argument("--max-linkedin", type=int, default=None)
    parser.add_argument("--linkedin-delay", type=float, default=1.0)
    args = parser.parse_args()

    ckpt: dict = {}
    if CKPT.exists():
        ckpt = json.loads(CKPT.read_text())

    contacts = load_contacts(IN_CSV)
    print(f"Chargé: {len(contacts)} contacts")

    if not args.skip_clean:
        contacts = clean_contacts(contacts)
        purge_shared_linkedin(contacts)
        print(f"Après nettoyage: {len(contacts)} contacts")

    if not args.skip_site:
        print("Enrichissement emails/LinkedIn depuis les pages source…")
        run_site_enrich(contacts, ckpt, max_pages=args.max_site)

    if not args.skip_linkedin:
        print("Recherche LinkedIn (Brave)…")
        run_linkedin_enrich(
            contacts,
            ckpt,
            tier=args.linkedin_tier,
            max_lookups=args.max_linkedin,
            delay=args.linkedin_delay,
        )

    save_ckpt(ckpt)
    contacts.sort(key=lambda c: (c.role_tier, c.nom, c.prenom))
    write_csv(OUT_CSV, contacts)
    write_report(contacts)

    with_li = sum(1 for c in contacts if c.linkedin_url)
    with_email = sum(1 for c in contacts if c.email)
    tier_a = sum(1 for c in contacts if c.role_tier == "A")
    print(f"Final: {len(contacts)} contacts | LinkedIn: {with_li} | Email: {with_email} | PI (A): {tier_a}")
    print(f"→ {OUT_CSV}")


if __name__ == "__main__":
    main()
