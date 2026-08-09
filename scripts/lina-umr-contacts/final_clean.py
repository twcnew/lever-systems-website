#!/usr/bin/env python3
"""Nettoyage final du CSV contacts — noms, rôles, emails, LinkedIn, doublons."""
from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from adapters.curie import fetch_person
from clean_and_enrich import dedupe, is_valid_name, linkedin_matches_contact, purge_shared_linkedin
from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report
from utils import infer_role_tier, normalize_space, slugify_name, split_name

ROOT = Path(__file__).resolve().parents[2]
IN_CSV = ROOT / "data" / "lina-umr-contacts.csv"
OUT_CSV = ROOT / "data" / "lina-umr-contacts.csv"
REPORT_PATH = ROOT / "data" / "lina-umr-contacts-clean-report.json"

GENERIC_EMAIL = re.compile(
    r"^(contact|info|secretariat|accueil|webmaster|noreply|communication|presse)@",
    re.I,
)
GRADE_NOM = re.compile(r"^(PU-PH|AHU|MCU-PH|MCF|CR\d|DR\d|HDR|PhD|Doyen)$", re.I)
JUNK_PRENOM = re.compile(
    r"^[,./\\]|^PU-PH|Innovation\s+et|Valorisation|équipe|equipe",
    re.I,
)
TITLE_PREFIX = re.compile(r"^(Dr|Pr|Prof|Professeur|Docteur|Mme|Mr|Mrs)\.?\s+", re.I)
PARTICLES = {
    "de",
    "du",
    "des",
    "le",
    "la",
    "les",
    "von",
    "van",
    "ben",
    "el",
    "al",
    "mc",
    "mac",
    "st",
    "di",
    "da",
    "del",
    "della",
    "y",
}
ROLE_START = re.compile(
    r"(Chargé[e]?\s+de\s+recherche|Directeur[rice]*\s+de\s+recherche|"
    r"Ingénieur[e]?\s+(?:de\s+recherche|d'[\u2019']études)|"
    r"Chercheur[euse]*(?:\s+post[- ]doctorant)?|Enseignant[e]?\s+Chercheur[e]?|"
    r"Professeur[e]?|Praticien[n]?e?\s+hospitalier[e]?|MCU-PH|PU-PH)",
    re.I,
)
EQUIPE_IN_ROLE = re.compile(r"Équipe\s*:\s*(.+?)(?:\s*Unité\s*:|$)", re.I)
BOILERPLATE_SUJET = re.compile(
    r"research teams|partner labs|leading core facilities|Soumettre|"
    r"Clinical research department|affiliated clinical units",
    re.I,
)


def load_contacts(path: Path) -> list[Contact]:
    contacts: list[Contact] = []
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))
    return contacts


def smart_title_word(word: str, *, first: bool) -> str:
    if not word:
        return word
    low = word.lower()
    if not first and low in PARTICLES:
        return low
    if "-" in word:
        return "-".join(smart_title_word(p, first=(i == 0)) for i, p in enumerate(word.split("-")))
    return word[:1].upper() + word[1:].lower() if len(word) > 1 else word.upper()


def smart_title_name(text: str) -> str:
    text = normalize_space(text)
    if not text:
        return text
    if text.isupper():
        return " ".join(smart_title_word(p, first=(i == 0)) for i, p in enumerate(text.split()))
    parts = text.split()
    return " ".join(smart_title_word(p, first=(i == 0)) for i, p in enumerate(parts))


def fix_multi_person_prenom(prenom: str, nom: str) -> tuple[str, str]:
    prenom = normalize_space(prenom)
    nom = normalize_space(nom)
    if "," not in prenom:
        return prenom, nom
    segments = [normalize_space(s) for s in prenom.split(",")]
    nom_low = nom.lower()
    for seg in reversed(segments):
        seg = TITLE_PREFIX.sub("", seg).strip()
        if not seg:
            continue
        if nom_low and nom_low in seg.lower():
            p, n = split_name(seg)
            if n.lower() == nom_low:
                return smart_title_name(p), smart_title_name(n)
        words = seg.split()
        if words and words[-1].lower() == nom_low:
            return smart_title_name(" ".join(words[:-1])), smart_title_name(words[-1])
    last = TITLE_PREFIX.sub("", segments[-1]).strip()
    if last and nom:
        if nom.lower() not in last.lower() and " " not in last:
            return smart_title_name(last), smart_title_name(nom)
        p, n = split_name(last)
        if n:
            return smart_title_name(p), smart_title_name(n or nom)
    return prenom, nom


def is_garbage_contact(c: Contact) -> bool:
    p, n = normalize_space(c.prenom), normalize_space(c.nom)
    if JUNK_PRENOM.search(p):
        return True
    if GRADE_NOM.match(n):
        return True
    if p.startswith(",") or n in {"Doyen"}:
        return True
    if "Innovation et" in p and n.lower() == "valorisation":
        return True
    if not p and n.isupper() and 3 <= len(n) <= 6 and c.role.strip().lower() == "chercheur":
        return True
    if not p and n and len(n.split()) == 1 and n[0].isupper() and n.lower() in {
        "vincent", "marie", "jean", "pierre", "paul", "anne", "sophie", "david",
    }:
        return True
    return not is_valid_name(p, n)


def clean_role_and_equipe(role: str, prenom: str, nom: str, equipe: str) -> tuple[str, str]:
    role = normalize_space(role)
    equipe = normalize_space(equipe)
    if not role:
        return role, equipe

    m_eq = EQUIPE_IN_ROLE.search(role)
    if m_eq:
        if not equipe:
            equipe = normalize_space(m_eq.group(1))
        role = normalize_space(role[: m_eq.start()])

    role = role.replace("Contacter", "").strip()
    role = re.sub(r"\s*Recherche\s*-\s*(?:Paris|Orsay)\s*$", "", role, flags=re.I).strip()

    full = normalize_space(f"{prenom} {nom}")
    if full:
        role = re.sub(rf"^{re.escape(full)}\s+", "", role, flags=re.I).strip()
        role = re.sub(rf"^{re.escape(full.upper())}\s+", "", role).strip()

    if role.upper() == role and len(role) > 20:
        m = ROLE_START.search(role)
        if m:
            role = role[m.start() :].strip()
        else:
            role = re.sub(r"^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s'\-]+?\s+", "", role).strip()

    m = ROLE_START.search(role)
    if m and m.start() > 0:
        role = role[m.start() :].strip()

    role = re.sub(r"\s*Unité\s*:.*$", "", role, flags=re.I).strip()
    if role in {"CNRS", "Inserm", "INSERM"}:
        role = f"Chercheur {role}"

    return normalize_space(role), equipe


def normalize_linkedin_url(url: str) -> str:
    url = normalize_space(url).split("?")[0].rstrip("/")
    if not url:
        return ""
    url = re.sub(r"^(https?://)(?:www\.)?", r"https://www.", url, flags=re.I)
    url = re.sub(r"/en$", "", url)
    return url


def is_generic_email(email: str) -> bool:
    return bool(email and GENERIC_EMAIL.match(email.strip()))


def clean_sujet(text: str, nom_unite: str) -> str:
    text = normalize_space(text)
    if not text:
        return text
    if BOILERPLATE_SUJET.search(text) or len(text) > 280:
        parts = [normalize_space(p) for p in re.split(r"[;|]+", text)]
        kept = []
        unit_bits = {b.strip().lower() for b in re.split(r"[;()—]+", nom_unite or "") if b.strip()}
        for part in parts:
            if not part or len(part) < 4:
                continue
            if BOILERPLATE_SUJET.search(part):
                continue
            if len(part) > 120:
                continue
            if part.lower() in unit_bits:
                kept.append(part)
                continue
            if re.search(r"génétique|immunologie|épidémiologie|cancer|hématologie|inflammation", part, re.I):
                kept.append(part)
        return ";".join(dict.fromkeys(kept))[:500]
    return text[:500]


def email_matches_person(email: str, prenom: str, nom: str) -> bool:
    if not email or "@" not in email:
        return True
    local = email.split("@")[0].lower().replace(".", "").replace("-", "").replace("_", "")
    nom_key = slugify_name(nom).replace("-", "")[:5] if nom else ""
    prenom_key = slugify_name(prenom.split()[0] if prenom else "")[:4]
    if nom_key and len(nom_key) >= 4 and nom_key in local:
        return True
    if prenom_key and len(prenom_key) >= 3 and prenom_key in local:
        return True
    return False


def fix_umr(c: Contact) -> None:
    umr = normalize_space(c.umr)
    if umr and umr not in {"—", "-", "–"}:
        c.umr = umr
        return
    for src in (c.nom_unite, c.source_url or "", c.sujet_recherche or ""):
        m = re.search(r"(?:UMR|U)\s*(\d+)", src, re.I)
        if m:
            c.umr = m.group(1)
            return


def normalize_contact(c: Contact) -> Contact:
    fix_umr(c)
    c.prenom = smart_title_name(normalize_space(c.prenom))
    c.nom = smart_title_name(normalize_space(c.nom))
    c.prenom, c.nom = fix_multi_person_prenom(c.prenom, c.nom)
    c.role, c.equipe = clean_role_and_equipe(c.role, c.prenom, c.nom, c.equipe)
    c.role_tier = infer_role_tier(c.role) if c.role else c.role_tier
    c.sujet_recherche = clean_sujet(c.sujet_recherche, c.nom_unite)
    c.email = normalize_space(c.email).lower()
    if is_generic_email(c.email) or not email_matches_person(c.email, c.prenom, c.nom):
        c.email = ""
    c.linkedin_url = normalize_linkedin_url(c.linkedin_url)
    c.nom_unite = normalize_space(c.nom_unite)
    c.ville = normalize_space(c.ville)
    c.delegation_inserm = normalize_space(c.delegation_inserm).lower()
    c.equipe = normalize_space(c.equipe)
    c.linkedin_source = normalize_space(c.linkedin_source)
    c.linkedin_confidence = normalize_space(c.linkedin_confidence)
    return c


def fix_from_curie_page(c: Contact, delay: float = 0.35) -> bool:
    url = (c.source_url or "").strip()
    if "curie.fr/personne/" not in url:
        return False
    time.sleep(delay)
    pdata = fetch_person(url)
    changed = False
    if pdata.get("full_name"):
        p, n = split_name(pdata["full_name"])
        p, n = smart_title_name(p), smart_title_name(n)
        if (p, n) != (c.prenom, c.nom):
            c.prenom, c.nom = p, n
            changed = True
    if pdata.get("role"):
        role = normalize_space(pdata["role"])
        if role and role != c.role:
            c.role = role
            c.role_tier = infer_role_tier(role)
            changed = True
    if pdata.get("equipe") and not c.equipe:
        c.equipe = pdata["equipe"]
        changed = True
    if pdata.get("bio") and (not c.sujet_recherche or len(c.sujet_recherche) < 30):
        c.sujet_recherche = pdata["bio"][:500]
        changed = True
    if pdata.get("email") and email_matches_person(pdata["email"], c.prenom, c.nom):
        if pdata["email"] != c.email:
            c.email = pdata["email"]
            changed = True
    return changed


def needs_curie_refetch(c: Contact) -> bool:
    if "curie.fr/personne/" not in (c.source_url or ""):
        return False
    role = c.role or ""
    if c.email and not email_matches_person(c.email, c.prenom, c.nom):
        return True
    return (
        len(role) > 55
        or "Contacter" in role
        or "Recherche -" in role
        or (c.nom and c.nom.upper() in role.upper() and len(role) > 25)
    )


def dedupe_irsl(contacts: list[Contact]) -> list[Contact]:
    """Une seule ligne par personne IRSL — garde la ligne la plus enrichie."""
    irsl_keys: dict[tuple[str, str], Contact] = {}
    other: list[Contact] = []
    for c in contacts:
        if "institut-recherche-saint-louis" not in (c.source_url or ""):
            other.append(c)
            continue
        if is_garbage_contact(c):
            continue
        key = (c.prenom.strip().lower(), c.nom.strip().lower())
        prev = irsl_keys.get(key)
        if not prev:
            irsl_keys[key] = c
            continue

        def score(x: Contact) -> tuple[int, int, int]:
            return (
                int(bool(x.linkedin_url)),
                int(bool(x.email)),
                int(x.score_fit_lina or "0"),
            )

        if score(c) > score(prev):
            irsl_keys[key] = c
    return other + list(irsl_keys.values())


def run_clean(contacts: list[Contact], *, refetch_curie: bool = True) -> tuple[list[Contact], dict]:
    stats = {
        "input_rows": len(contacts),
        "removed_garbage": 0,
        "curie_refetched": 0,
        "emails_cleared_generic": 0,
        "linkedin_cleared": 0,
        "roles_fixed": 0,
        "names_fixed": 0,
    }

    cleaned: list[Contact] = []
    for c in contacts:
        if is_garbage_contact(c):
            stats["removed_garbage"] += 1
            continue
        before_role = c.role
        before_prenom, before_nom = c.prenom, c.nom
        before_email = c.email
        c = normalize_contact(c)
        if (c.prenom, c.nom) != (before_prenom, before_nom):
            stats["names_fixed"] += 1
        if c.role != before_role:
            stats["roles_fixed"] += 1
        if before_email and not c.email:
            stats["emails_cleared_generic"] += 1
        cleaned.append(c)

    contacts = dedupe_irsl(cleaned)

    if refetch_curie:
        for c in contacts:
            if needs_curie_refetch(c):
                if fix_from_curie_page(c):
                    stats["curie_refetched"] += 1
                c = normalize_contact(c)

    before_li = sum(1 for c in contacts if c.linkedin_url)
    purge_shared_linkedin(contacts)
    after_li = sum(1 for c in contacts if c.linkedin_url)
    stats["linkedin_cleared"] = before_li - after_li

    for c in contacts:
        if c.linkedin_url and c.linkedin_confidence == "low":
            if not linkedin_matches_contact(c.linkedin_url, c.prenom, c.nom):
                c.linkedin_url = ""
                c.linkedin_source = ""
                c.linkedin_confidence = ""
                stats["linkedin_cleared"] += 1

    contacts = dedupe(contacts)
    contacts.sort(key=lambda c: (c.role_tier, c.nom, c.prenom))
    stats["output_rows"] = len(contacts)
    return contacts, stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Nettoyage final lina-umr-contacts.csv")
    parser.add_argument("--input", type=Path, default=IN_CSV)
    parser.add_argument("--output", type=Path, default=OUT_CSV)
    parser.add_argument("--no-curie-fetch", action="store_true", help="Ne pas re-fetch les fiches Curie")
    parser.add_argument("--no-backup", action="store_true")
    args = parser.parse_args()

    contacts = load_contacts(args.input)
    if not args.no_backup and args.output == args.input:
        backup = args.input.with_suffix(args.input.suffix + ".bak")
        shutil.copy2(args.input, backup)
        print(f"Backup → {backup}")

    contacts, stats = run_clean(contacts, refetch_curie=not args.no_curie_fetch)
    write_csv(args.output, contacts)
    write_report(contacts)

    REPORT_PATH.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")

    with_li = sum(1 for c in contacts if c.linkedin_url)
    with_email = sum(1 for c in contacts if c.email)
    with_both = sum(1 for c in contacts if c.linkedin_url or c.email)
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    print(
        f"Final: {len(contacts)} contacts | LI: {with_li} | Email: {with_email} | "
        f"LI ou email: {with_both} ({round(100*with_both/max(len(contacts),1),1)}%)"
    )
    print(f"→ {args.output}")


if __name__ == "__main__":
    main()
