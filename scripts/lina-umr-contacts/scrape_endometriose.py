#!/usr/bin/env python3
"""Scrape et assemble un CSV dédié chercheurs endométriose (France)."""
from __future__ import annotations

import csv
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

sys.path.insert(0, str(Path(__file__).resolve().parent))

from http_client import fetch_soup
from models import CSV_FIELDS
from utils import (
    extract_emails,
    extract_linkedin_urls,
    infer_role_tier,
    normalize_space,
    slugify_name,
    split_name,
)

ROOT = Path(__file__).resolve().parents[2]
MAIN_CSV = ROOT / "data" / "lina-umr-contacts.csv"
OUT_CSV = ROOT / "data" / "lina-umr-contacts-endometriose.csv"
REPORT = ROOT / "data" / "lina-umr-contacts-endometriose-report.md"

EXTRA_FIELDS = [
    "lien_endometriose",
    "programme",
    "equipe_recherche",
    "dans_base_principale",
    "notes_endometriose",
]

COCHIN = "https://www.institutcochin.fr"
CESP = "https://cesp.inserm.fr"

# Équipes / labos ciblés endométriose
COCHIN_TEAMS = [
    (
        "Pathogénie et traitements innovants des maladies fibro-inflammatoires chroniques",
        f"{COCHIN}/equipes/pathogenie-traitements-innovants-maladies-fibro-inflammatoires-chroniques",
        "equipe_cochin_fibro_inflammatoire",
        "InENDO;MultiMENDo",
    ),
    (
        "Génomique, épigénétique et physiopathologie de la reproduction",
        f"{COCHIN}/equipes/gametes-naissance-genomique-epigenetique-physiopathologie-reproduction",
        "equipe_cochin_reproduction",
        "InENDO;génétique endométriose",
    ),
]

# Consortium InENDO / EPI-ENDO — chercheurs clés hors scrape automatique
SEED_RESEARCHERS = [
    {
        "prenom": "Marina",
        "nom": "Kvaskoff",
        "role": "Épidémiologiste — Chargée de recherche Inserm",
        "role_tier": "B",
        "umr": "1018",
        "nom_unite": "CESP — Épidémiologie populations (UMR 1018)",
        "equipe": "Exposome et hérédité",
        "equipe_recherche": "Exposome et hérédité (Gustave Roussy / CESP)",
        "email": "marina.kvaskoff@inserm.fr",
        "linkedin_url": "https://www.linkedin.com/in/marinakvaskoff",
        "linkedin_source": "search",
        "linkedin_confidence": "high",
        "ville": "Villejuif",
        "delegation_inserm": "sud",
        "score_fit_lina": "9",
        "source_url": f"{CESP}/fr/agent/kvaskoff",
        "lien_endometriose": "direct",
        "programme": "EPI-ENDO;InENDO;ComPaRe-Endométriose",
        "notes_endometriose": "Coordination EPI-ENDO — épidémiologie de l'endométriose en France",
    },
    {
        "prenom": "Fatima",
        "nom": "Mechta-Grigoriou",
        "role": "Directrice de recherche Inserm",
        "role_tier": "A",
        "umr": "1339",
        "nom_unite": "Immunité et Cancer (Institut Curie U932)",
        "equipe": "Stress et Cancer",
        "equipe_recherche": "Stress et Cancer — Institut Curie",
        "email": "fatima.mechta-grigoriou@curie.fr",
        "linkedin_url": "https://www.linkedin.com/in/fatima-mechta-grigoriou-57088319",
        "linkedin_source": "site",
        "linkedin_confidence": "high",
        "ville": "Paris",
        "delegation_inserm": "est",
        "score_fit_lina": "8",
        "source_url": "https://curie.fr/personne/fatima-mechta-grigoriou",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Responsable axe 1.6 — atlas moléculaire des lésions d'endométriose",
    },
    {
        "prenom": "German",
        "nom": "Cano-Sancho",
        "role": "Directeur de recherche — exposome",
        "role_tier": "A",
        "umr": "1329",
        "nom_unite": "LABERCA — Oniris / INRAE (UMR 1329)",
        "equipe": "Exposome alimentaire",
        "equipe_recherche": "LABERCA, Nantes",
        "email": "german.cano-sancho@oniris-nantes.fr",
        "linkedin_url": "",
        "ville": "Nantes",
        "delegation_inserm": "ouest",
        "score_fit_lina": "9",
        "source_url": "https://www.oniris-nantes.fr/",
        "lien_endometriose": "direct",
        "programme": "InENDO",
        "notes_endometriose": "Co-coordinateur consortium InENDO — exposome chimique / métabolome",
    },
    {
        "prenom": "Vincent",
        "nom": "Prévot",
        "role": "Directeur de recherche Inserm",
        "role_tier": "A",
        "umr": "1172",
        "nom_unite": "UMR 1172 — Neuroendocrinologie (Lille)",
        "equipe": "Neuroendocrinologie",
        "equipe_recherche": "Neuroendocrinologie, Lille",
        "email": "",
        "linkedin_url": "",
        "ville": "Lille",
        "delegation_inserm": "nord",
        "score_fit_lina": "8",
        "source_url": "https://umr1172.univ-lille.fr/",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axe 2.3 — fonctions neuroendocrines et endométriose",
    },
    {
        "prenom": "Michel",
        "nom": "Neunlist",
        "role": "Chercheur — neurogastroentérologie",
        "role_tier": "B",
        "umr": "1235",
        "nom_unite": "UMR 1235 — Nantes",
        "equipe": "TENS",
        "equipe_recherche": "Nantes — microbiome / axe intestin",
        "email": "",
        "linkedin_url": "",
        "ville": "Nantes",
        "delegation_inserm": "ouest",
        "score_fit_lina": "7",
        "source_url": "https://www.inserm.fr/",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axe 2.5 — fonction intestinale et endométriose",
    },
    {
        "prenom": "Krystel",
        "nom": "Nyangoh Timoh",
        "role": "Professeure des universités — Praticienne hospitalière",
        "role_tier": "A",
        "umr": "1099",
        "nom_unite": "LTSI — Laboratoire Traitement du Signal et de l'Image (UMR 1099)",
        "equipe": "Imagerie chirurgicale / CHU Rennes",
        "equipe_recherche": "LTSI / CHU Rennes — endométriose et chirurgie",
        "email": "krystel.nyangoh-timoh@chu-rennes.fr",
        "linkedin_url": "https://www.linkedin.com/in/krystel-nyangoh-timoh-1b619154",
        "linkedin_source": "search",
        "linkedin_confidence": "high",
        "ville": "Rennes",
        "delegation_inserm": "ouest",
        "score_fit_lina": "9",
        "source_url": "https://projet-air.univ-rennes.fr/interlocuteurs/krystel-nyangoh-timoh",
        "lien_endometriose": "direct",
        "programme": "InENDO",
        "notes_endometriose": "Axe 1.4 — imagerie et base vidéo chirurgicale endométriose",
    },
    {
        "prenom": "Sarah",
        "nom": "Le Vigouroux",
        "role": "Maître de conférences HDR — psychologie clinique",
        "role_tier": "B",
        "umr": "",
        "nom_unite": "APSY-V — Université de Nîmes",
        "equipe": "Douleur et mode de vie",
        "equipe_recherche": "APSY-V — psychologie de l'endométriose",
        "email": "sarah.le-vigouroux@umontpellier.fr",
        "linkedin_url": "",
        "ville": "Nîmes",
        "delegation_inserm": "sud",
        "score_fit_lina": "8",
        "source_url": "https://cv.hal.science/sarah-le-vigouroux",
        "lien_endometriose": "direct",
        "programme": "InENDO;EndoTempo",
        "notes_endometriose": "Axe 1.5 — douleur, mode de vie, affects",
    },
    {
        "prenom": "Françoise",
        "nom": "Lenfant",
        "role": "Directrice de recherche Inserm",
        "role_tier": "A",
        "umr": "1297",
        "nom_unite": "I2MC — Institut des Maladies Métaboliques et Cardiovasculaires (UMR 1297)",
        "equipe": "EstER — récepteurs œstrogéniques",
        "equipe_recherche": "I2MC Toulouse — signalisation hormonale endométriose",
        "email": "francoise.lenfant@inserm.fr",
        "linkedin_url": "https://www.linkedin.com/in/fran%C3%A7oise-lenfant-37540512b",
        "linkedin_source": "search",
        "linkedin_confidence": "high",
        "ville": "Toulouse",
        "delegation_inserm": "sud",
        "score_fit_lina": "9",
        "source_url": "https://www.i2mc.inserm.fr/equipe-lenfant-fontaine-2/",
        "lien_endometriose": "direct",
        "programme": "InENDO;EDISON",
        "notes_endometriose": "Axes 1.6–2.1 — atlas moléculaire et signalisation hormonale",
    },
    {
        "prenom": "Samuel",
        "nom": "Alizon",
        "role": "Directeur de recherche CNRS",
        "role_tier": "A",
        "umr": "",
        "nom_unite": "CIRB — Collège de France (Paris)",
        "equipe": "Écologie et évolution de la santé",
        "equipe_recherche": "CIRB — modélisation et intégration multi-omique",
        "email": "samuel.alizon@college-de-france.fr",
        "linkedin_url": "",
        "ville": "Paris",
        "delegation_inserm": "nord",
        "score_fit_lina": "8",
        "source_url": "https://cv.hal.science/samuel-alizon",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axes 1.3 et 3.3 — microbiome et biomarqueurs prédictifs",
    },
    {
        "prenom": "Agnès",
        "nom": "Bernet",
        "role": "Professeure des universités — cancérologie",
        "role_tier": "A",
        "umr": "1052",
        "nom_unite": "CRCL — Centre de Recherche en Cancérologie de Lyon (UMR 1052)",
        "equipe": "Apoptose, cancer et développement",
        "equipe_recherche": "CRCL Lyon — Netrine-1 / NP137",
        "email": "agnes.bernet@univ-lyon1.fr",
        "linkedin_url": "",
        "ville": "Lyon",
        "delegation_inserm": "est",
        "score_fit_lina": "8",
        "source_url": "https://www.iufrance.fr/les-membres-de-liuf/membre/24-agnes-bernet.html",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axes 1.7, 3.1–3.2 — mécanismes sélectionnés et thérapies précliniques",
    },
    {
        "prenom": "Andreas",
        "nom": "Schedl",
        "role": "Directeur de recherche Inserm",
        "role_tier": "A",
        "umr": "7277",
        "nom_unite": "iBV — Institut de Biologie Valrose (UMR 7277)",
        "equipe": "Développement et homéostasie tissulaire",
        "equipe_recherche": "iBV Nice — signalisation hormonale",
        "email": "schedl@unice.fr",
        "linkedin_url": "",
        "ville": "Nice",
        "delegation_inserm": "sud",
        "score_fit_lina": "8",
        "source_url": "http://ibv.unice.fr/research-team/schedl/",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axes 1.7 et 2.1 — gènes de signalisation hormonale",
    },
    {
        "prenom": "Elodie",
        "nom": "Chantalat",
        "role": "Professeure des universités — Praticienne hospitalière",
        "role_tier": "A",
        "umr": "1297",
        "nom_unite": "CHU Toulouse / I2MC (UMR 1297)",
        "equipe": "Filière ENDOCCITANIE",
        "equipe_recherche": "CHU Toulouse — cohortes endométriose",
        "email": "elodie.chantalat@chu-toulouse.fr",
        "linkedin_url": "",
        "ville": "Toulouse",
        "delegation_inserm": "sud",
        "score_fit_lina": "9",
        "source_url": "https://www.occitanie.ars.sante.fr/prendre-en-charge-lendometriose-votre-ars-agit",
        "lien_endometriose": "direct",
        "programme": "InENDO;ENDOCCITANIE",
        "notes_endometriose": "Axe 1.1 — cohortes multicentriques et biocollections",
    },
    {
        "prenom": "Adrien",
        "nom": "Bartoli",
        "role": "Professeur des universités — vision par ordinateur",
        "role_tier": "A",
        "umr": "",
        "nom_unite": "Institut Pascal — Université Clermont Auvergne / CNRS",
        "equipe": "EnCoV — Endoscopy and Computer Vision",
        "equipe_recherche": "Institut Pascal — IA chirurgie endométriose",
        "email": "adrien.bartoli@gmail.com",
        "linkedin_url": "",
        "ville": "Clermont-Ferrand",
        "delegation_inserm": "sud",
        "score_fit_lina": "8",
        "source_url": "https://encov.ip.uca.fr/ab/",
        "lien_endometriose": "consortium_inendo",
        "programme": "InENDO",
        "notes_endometriose": "Axe 3.3 — intégration multi-omique et imagerie chirurgicale",
    },
    {
        "prenom": "Coralie",
        "nom": "Fontaine",
        "role": "Chargée de recherche Inserm",
        "role_tier": "B",
        "umr": "1297",
        "nom_unite": "I2MC — Institut des Maladies Métaboliques et Cardiovasculaires (UMR 1297)",
        "equipe": "EstER — récepteurs œstrogéniques",
        "equipe_recherche": "I2MC Toulouse — organoïdes endométriose",
        "email": "coralie.fontaine@inserm.fr",
        "linkedin_url": "",
        "ville": "Toulouse",
        "delegation_inserm": "sud",
        "score_fit_lina": "8",
        "source_url": "https://www.i2mc.inserm.fr/equipe-lenfant-fontaine-2/",
        "lien_endometriose": "associe",
        "programme": "InENDO;EDISON",
        "notes_endometriose": "Co-PI équipe Lenfant/Fontaine — ERα et organoïdes endométriose",
    },
]

ENDO_KEYWORDS = re.compile(
    r"endom[eé]tr|multimendo|epi-endo|inendo|adenomyo",
    re.I,
)

ROLE_SKIP = re.compile(
    r"^ITA statutaire$|^Éméritat",
    re.I,
)


def load_main_index() -> dict[tuple[str, str], dict]:
    idx: dict[tuple[str, str], dict] = {}
    if not MAIN_CSV.exists():
        return idx
    with MAIN_CSV.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = (row["prenom"].strip().lower(), row["nom"].strip().lower())
            idx[key] = row
    return idx


def smart_title_name(text: str) -> str:
    text = normalize_space(text)
    if not text:
        return text
    if text.isupper():
        return " ".join(w[:1].upper() + w[1:].lower() for w in text.split())
    return text


def parse_cochin_member_name(name: str) -> tuple[str, str]:
    name = normalize_space(name)
    if not name:
        return "", ""
    parts = name.split()
    if len(parts) >= 2 and parts[-1].isupper() and len(parts[-1]) > 2:
        p = " ".join(parts[:-1])
        n = parts[-1]
        return smart_title_name(p), smart_title_name(n)
    p, n = split_name(name.title() if name.isupper() else name)
    return smart_title_name(p), smart_title_name(n)


def parse_cochin_member_link(text: str, href: str) -> dict | None:
    text = normalize_space(text)
    if not text or len(text) < 5:
        return None
    m = re.match(
        r"^(.+?)\s+(Chercheur|ITA|Doctorant|Post|Ingénieur|Ingénieure|Technicien|MCU|PU-PH|Éméritat|Master)",
        text,
        re.I,
    )
    name = m.group(1).strip() if m else text
    role = text[len(name) :].strip() if m else "Chercheur"
    p, n = parse_cochin_member_name(name)
    if not n or n.lower() in {"master", "doctorant", "chercheur"}:
        return None
    return {
        "prenom": p,
        "nom": n,
        "role": role,
        "source_url": urljoin(COCHIN, href),
    }


def scrape_cochin_team(equipe_label: str, url: str, lien: str, programme: str) -> list[dict]:
    soup = fetch_soup(url, delay=0.35)
    if not soup:
        return []
    members: list[dict] = []
    seen: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/annuaire/" not in href or href.rstrip("/").endswith("/annuaire"):
            continue
        parsed = parse_cochin_member_link(a.get_text(" ", strip=True), href)
        if not parsed or parsed["source_url"] in seen:
            continue
        seen.add(parsed["source_url"])
        members.append(
            {
                **parsed,
                "umr": "1016",
                "nom_unite": "Institut Cochin (UMR 8104 / U1016)",
                "equipe": equipe_label,
                "equipe_recherche": equipe_label,
                "ville": "Paris 14",
                "delegation_inserm": "nord",
                "score_fit_lina": "9",
                "lien_endometriose": lien,
                "programme": programme,
                "sujet_recherche": "endométriose;maladies fibro-inflammatoires chroniques;reproduction",
            }
        )
    return members


def enrich_cochin_person(row: dict, delay: float = 0.2) -> None:
    soup = fetch_soup(row["source_url"], delay=delay)
    if not soup:
        return
    emails = extract_emails(soup)
    personal = [e for e in emails if not e.startswith("contact@")]
    if personal:
        row["email"] = personal[0]
    links = extract_linkedin_urls(soup)
    if links and not row.get("linkedin_url"):
        row["linkedin_url"] = links[0].split("?")[0].rstrip("/")
        row["linkedin_source"] = "site"
        row["linkedin_confidence"] = "high"
    text = soup.get_text(" ", strip=True)
    if ENDO_KEYWORDS.search(text):
        row["lien_endometriose"] = "direct"
        if "notes_endometriose" not in row:
            row["notes_endometriose"] = "Page personnelle mentionne l'endométriose"
    h1 = soup.find("h1")
    if h1:
        p, n = split_name(normalize_space(h1.get_text()))
        if n:
            row["prenom"], row["nom"] = smart_title_name(p), smart_title_name(n)


def parse_cesp_agent_link(text: str, href: str) -> dict | None:
    text = normalize_space(text)
    if not text or "/agent/" not in href:
        return None
    # "Aurelien AMIOT Chercheur.se Epidémiologiste"
    parts = text.split()
    if len(parts) < 2:
        return None
    # find role keyword
    role_idx = None
    for i, w in enumerate(parts):
        if re.match(r"Chercheur|Doctorant|Ingénieur|Biostat|Data|Epidémi|Médecin|Chef", w, re.I):
            role_idx = i
            break
    if role_idx and role_idx >= 2:
        name = " ".join(parts[: role_idx - 0])
        # name often ALL CAPS for nom
        if parts[role_idx - 1].isupper() and len(parts[role_idx - 1]) > 2:
            prenom = " ".join(parts[:-2]) if len(parts) > 2 else parts[0]
            # simpler: split_name on full before role words
        name = " ".join(parts[:role_idx])
        role = " ".join(parts[role_idx:])
    else:
        name, role = text, "Chercheur"
    p, n = split_name(name.title() if name.isupper() else name)
    if not n and len(parts) >= 2:
        # LASTNAME in caps pattern
        for i, w in enumerate(parts):
            if w.isupper() and len(w) > 2:
                p = " ".join(parts[:i])
                n = w
                role = " ".join(parts[i + 1 :])
                break
    p, n = smart_title_name(p), smart_title_name(n)
    if not n:
        return None
    return {
        "prenom": p,
        "nom": n,
        "role": role,
        "source_url": urljoin(CESP, href),
    }


def scrape_cesp_exposome_endo() -> list[dict]:
    """Kvaskoff + membres Exposome dont la page mentionne l'endométriose."""
    url = f"{CESP}/fr/equipe/exposome-et-h%C3%A9r%C3%A9dit%C3%A9"
    soup = fetch_soup(url, delay=0.35)
    if not soup:
        return []
    agents: list[dict] = []
    seen: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/agent/" not in href:
            continue
        slug = href.rstrip("/").split("/")[-1]
        if slug in seen:
            continue
        seen.add(slug)
        if slug == "kvaskoff":
            continue  # handled via seed
        parsed = parse_cesp_agent_link(a.get_text(" ", strip=True), href)
        if not parsed:
            continue
        parsed.update(
            {
                "umr": "1018",
                "nom_unite": "CESP — Épidémiologie populations (UMR 1018)",
                "equipe": "Exposome et hérédité",
                "equipe_recherche": "Exposome et hérédité (CESP / Gustave Roussy)",
                "ville": "Villejuif",
                "delegation_inserm": "sud",
                "score_fit_lina": "7",
                "lien_endometriose": "equipe_exposome",
                "programme": "EPI-ENDO",
                "sujet_recherche": "épidémiologie;exposome;cohortes femmes",
            }
        )
        agents.append(parsed)
    # filter to endo mentions on agent page (sample leaders + scan)
    endo_agents: list[dict] = []
    for row in agents:
        enrich_cesp_agent(row)
        if row.get("lien_endometriose") == "direct" or ENDO_KEYWORDS.search(
            row.get("notes_endometriose", "")
        ):
            endo_agents.append(row)
    return endo_agents


def enrich_cesp_agent(row: dict, delay: float = 0.2) -> None:
    soup = fetch_soup(row["source_url"], delay=delay)
    if not soup:
        return
    emails = extract_emails(soup)
    if emails:
        row["email"] = emails[0]
    links = extract_linkedin_urls(soup)
    if links:
        row["linkedin_url"] = links[0].split("?")[0].rstrip("/")
        row["linkedin_source"] = "site"
        row["linkedin_confidence"] = "high"
    text = soup.get_text(" ", strip=True)
    if ENDO_KEYWORDS.search(text):
        row["lien_endometriose"] = "direct"
        row["notes_endometriose"] = "Page CESP mentionne l'endométriose"


def mark_endo_leaders(row: dict) -> None:
    """Boost known endometriosis leaders within Cochin teams."""
    full = f"{row.get('prenom', '')} {row.get('nom', '')}".lower()
    leaders = {
        "ludivine doridot": ("direct", "MultiMENDo;InENDO — ERC Starting Grant"),
        "daniel vaiman": ("direct", "Prédispositions génétiques à l'endométriose (Inserm)"),
        "charles chapron": ("direct", "Chirurgie et recherche clinique endométriose"),
        "louis marcellin": ("direct", "Gynécologie-obstétrique et endométriose"),
        "françoise lenfant": ("consortium_inendo", "InENDO axe 2.1 — signalisation hormonale"),
        "francoise lenfant": ("consortium_inendo", "InENDO axe 2.1 — signalisation hormonale"),
        "sven günther": ("associe", "Gynécologie endocrinienne"),
        "sven gunther": ("associe", "Gynécologie endocrinienne"),
        "niloufar kavian-tessler": ("associe", "Recherche gynécologique"),
        "pietro santulli": ("associe", "Gynécologie et endométriose"),
    }
    for name, (lien, note) in leaders.items():
        if name in full:
            row["lien_endometriose"] = lien
            row["notes_endometriose"] = note
            if "InENDO" not in row.get("programme", ""):
                row["programme"] = merge_programme(row.get("programme", ""), "InENDO")


def merge_programme(a: str, b: str) -> str:
    parts = []
    for chunk in (a, b):
        for p in chunk.split(";"):
            p = p.strip()
            if p and p not in parts:
                parts.append(p)
    return ";".join(parts)


def merge_from_main(row: dict, main_idx: dict[tuple[str, str], dict]) -> None:
    key = (row.get("prenom", "").strip().lower(), row.get("nom", "").strip().lower())
    prev = main_idx.get(key)
    if not prev:
        row["dans_base_principale"] = "non"
        return
    row["dans_base_principale"] = "oui"
    for field in ("email", "linkedin_url", "linkedin_source", "linkedin_confidence"):
        if not row.get(field) and prev.get(field):
            row[field] = prev[field]


def finalize_row(row: dict) -> dict:
    row.setdefault("role_tier", infer_role_tier(row.get("role", "")))
    row.setdefault("equipe", row.get("equipe_recherche", ""))
    row.setdefault("sujet_recherche", "endométriose")
    row.setdefault("dans_base_principale", "non")
    row.setdefault("linkedin_source", "")
    row.setdefault("linkedin_confidence", "")
    row.setdefault("email", "")
    row.setdefault("linkedin_url", "")
    row.setdefault("notes_endometriose", "")
    return row


def dedupe_rows(rows: list[dict]) -> list[dict]:
    seen: dict[tuple[str, str], dict] = {}
    for row in rows:
        key = (row["prenom"].strip().lower(), row["nom"].strip().lower())
        if key not in seen:
            seen[key] = row
            continue
        prev = seen[key]
        for field in ("email", "linkedin_url", "linkedin_source", "linkedin_confidence", "notes_endometriose"):
            if not prev.get(field) and row.get(field):
                prev[field] = row[field]
        if row.get("lien_endometriose") == "direct" and prev.get("lien_endometriose") != "direct":
            prev["lien_endometriose"] = "direct"
    return list(seen.values())


def build_rows(main_idx: dict) -> list[dict]:
    rows: list[dict] = []

    # Seeds consortium + Kvaskoff
    for seed in SEED_RESEARCHERS:
        row = finalize_row(dict(seed))
        merge_from_main(row, main_idx)
        rows.append(row)

    # Cochin teams
    for equipe_label, url, lien, programme in COCHIN_TEAMS:
        team = scrape_cochin_team(equipe_label, url, lien, programme)
        for row in team:
            if ROLE_SKIP.search(row.get("role", "")):
                continue
            enrich_cochin_person(row)
            mark_endo_leaders(row)
            # Vaiman team: keep all with genetique tag, or only endo-mentioned + leaders
            if lien == "equipe_cochin_reproduction":
                if row.get("lien_endometriose") not in {"direct", "consortium_inendo", "associe"}:
                    if row["nom"].lower() != "vaiman":
                        continue
            row = finalize_row(row)
            merge_from_main(row, main_idx)
            rows.append(row)

    # CESP exposome — pages mentionnant endométriose
    for row in scrape_cesp_exposome_endo():
        row = finalize_row(row)
        merge_from_main(row, main_idx)
        rows.append(row)

    return dedupe_rows(rows)


def write_csv(path: Path, rows: list[dict]) -> None:
    fields = CSV_FIELDS + EXTRA_FIELDS
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for row in sorted(rows, key=lambda r: (r.get("lien_endometriose", ""), r.get("nom", ""), r.get("prenom", ""))):
            w.writerow({k: row.get(k, "") for k in fields})


def write_report(rows: list[dict]) -> None:
    total = len(rows)
    direct = sum(1 for r in rows if r.get("lien_endometriose") == "direct")
    with_contact = sum(1 for r in rows if r.get("email") or r.get("linkedin_url"))
    in_main = sum(1 for r in rows if r.get("dans_base_principale") == "oui")
    lines = [
        "# Rapport — contacts endométriose",
        "",
        f"- **Contacts** : {total}",
        f"- **Lien direct endométriose** : {direct}",
        f"- **Avec email ou LinkedIn** : {with_contact} ({round(100*with_contact/max(total,1),1)}%)",
        f"- **Déjà dans la base principale** : {in_main}",
        "",
        "## Par type de lien",
        "",
    ]
    from collections import Counter

    for lien, n in Counter(r.get("lien_endometriose", "") for r in rows).most_common():
        lines.append(f"- {lien or '(vide)'} : {n}")
    lines.extend(["", "## Chercheurs clés (lien direct)", ""])
    for r in rows:
        if r.get("lien_endometriose") == "direct":
            contact = r.get("email") or r.get("linkedin_url") or "—"
            lines.append(f"- {r['prenom']} {r['nom']} — {r.get('equipe_recherche', '')[:60]} — {contact}")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def merge_to_main(rows: list[dict]) -> int:
    """Ajoute les contacts absents de la base principale."""
    from models import Contact
    from scrape import dedupe, write_csv

    existing: list[Contact] = []
    if MAIN_CSV.exists():
        with MAIN_CSV.open(encoding="utf-8") as f:
            for row in csv.DictReader(f):
                existing.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))

    keys = {(c.prenom.strip().lower(), c.nom.strip().lower()) for c in existing}
    added = 0
    skip_noms = {"master", "doctorant", "chercheur", "ingénieur", "ingénieure"}
    for row in rows:
        nom = row.get("nom", "").strip().lower()
        prenom = row.get("prenom", "").strip().lower()
        if not nom or nom in skip_noms:
            continue
        key = (prenom, nom)
        if key in keys:
            continue
        contact = Contact(**{k: row.get(k, "") for k in CSV_FIELDS})
        if "endométriose" not in (contact.sujet_recherche or ""):
            topics = [t.strip() for t in (contact.sujet_recherche or "").split(";") if t.strip()]
            if "endométriose" not in topics:
                topics.insert(0, "endométriose")
            contact.sujet_recherche = ";".join(topics)
        existing.append(contact)
        keys.add(key)
        added += 1

    if added:
        write_csv(MAIN_CSV, dedupe(existing))
    return added


def main() -> None:
    main_idx = load_main_index()
    print(f"Base principale indexée : {len(main_idx)} personnes")
    rows = build_rows(main_idx)
    write_csv(OUT_CSV, rows)
    write_report(rows)
    added = merge_to_main(rows)
    direct = sum(1 for r in rows if r.get("lien_endometriose") == "direct")
    contact = sum(1 for r in rows if r.get("email") or r.get("linkedin_url"))
    print(f"→ {len(rows)} contacts endométriose | {direct} directs | {contact} avec contact")
    print(f"→ {OUT_CSV}")
    if added:
        print(f"→ {added} contacts ajoutés à {MAIN_CSV}")


if __name__ == "__main__":
    main()
