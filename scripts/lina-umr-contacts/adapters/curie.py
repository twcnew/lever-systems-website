from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from http_client import fetch_soup
from models import Contact
from utils import (
    extract_emails,
    extract_linkedin_urls,
    infer_role_tier,
    merge_topics,
    normalize_space,
    should_include_role,
    split_name,
)

CURIE_BASE = "https://curie.fr"
_person_cache: dict[str, dict] = {}


def _unit_umr_map() -> dict[str, str]:
    return {
        "u932": "932",
        "u1339": "1339",
        "u1330": "1330",
        "u1331": "1331",
        "u934": "934",
        "umr3664": "993",
        "umr9187": "1196",
        "umr9029": "1288",
        "umr144": "144",
        "umr168": "168",
        "umr3244": "3244",
        "umr3348": "3348",
    }


def list_team_urls() -> list[tuple[str, str, str]]:
    """Return (team_url, team_name, leader_name) for all Curie teams."""
    teams: list[tuple[str, str, str]] = []
    seen: set[str] = set()
    page = 1
    while page <= 5:
        url = f"{CURIE_BASE}/equipes-recherche" + (f"?page={page}" if page > 1 else "")
        soup = fetch_soup(url)
        if not soup:
            break
        page_links = re.findall(r'href="(/equipe/[^"#?]+)"', str(soup))
        if not page_links:
            break
        new_on_page = 0
        for path in page_links:
            full = urljoin(CURIE_BASE, path)
            if full in seen:
                continue
            seen.add(full)
            new_on_page += 1
            teams.append((full, "", ""))
        if new_on_page == 0:
            break
        page += 1
    return teams


def fetch_person(slug_url: str) -> dict:
    if slug_url in _person_cache:
        return _person_cache[slug_url]
    soup = fetch_soup(slug_url)
    data = {
        "url": slug_url,
        "full_name": "",
        "role": "",
        "equipe": "",
        "unite": "",
        "bio": "",
        "email": "",
        "linkedin": "",
    }
    if not soup:
        _person_cache[slug_url] = data
        return data

    h1 = soup.find("h1")
    if h1:
        data["full_name"] = normalize_space(h1.get_text())

    roles = []
    for block in soup.find_all(["h3", "p", "div"]):
        text = normalize_space(block.get_text(" ", strip=True))
        if not text:
            continue
        if re.search(r"chef d.?équipe|directeur|directrice|chercheur|inserm|cnrs|professeur", text, re.I):
            if len(text) < 120:
                roles.append(text)
        if text.startswith("Équipe") or text.startswith("Equipe"):
            data["equipe"] = text.replace("Équipe :", "").replace("Equipe :", "").strip(" :")
        if text.startswith("Unité") or text.startswith("Unite"):
            data["unite"] = text.replace("Unité :", "").replace("Unite :", "").strip(" :")

    if roles:
        data["role"] = roles[0]

    pres = soup.find(string=re.compile(r"Présentation", re.I))
    if pres:
        parent = pres.find_parent()
        if parent:
            nxt = parent.find_next_sibling(["p", "div"])
            if nxt:
                data["bio"] = normalize_space(nxt.get_text(" ", strip=True))[:600]

    emails = extract_emails(soup)
    if emails:
        data["email"] = emails[0]
    linkedins = extract_linkedin_urls(soup)
    if linkedins:
        data["linkedin"] = linkedins[0]

    _person_cache[slug_url] = data
    return data


def scrape_team(team_url: str, default_umr: str = "", meta: Optional[dict] = None) -> list[Contact]:
    meta = meta or {}
    soup = fetch_soup(team_url)
    if not soup:
        return []

    team_name = ""
    h1 = soup.find("h1")
    if h1:
        team_name = normalize_space(h1.get_text())

    unit_name = ""
    unit_match = re.search(r"\(U\d+[^)]*\)|\(UMR[^)]*\)", str(soup), re.I)
    if unit_match:
        unit_name = unit_match.group(0).strip("()")

    umr = default_umr
    for key, val in _unit_umr_map().items():
        if key in team_url.lower() or key in unit_name.lower():
            umr = val
            break

    person_paths = list(dict.fromkeys(re.findall(r'href="(/personne/[^"#?]+)"', str(soup))))
    contacts: list[Contact] = []

    if not person_paths:
        leader_match = re.search(r"Équipe\s*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\-\s']+)", str(soup))
        if leader_match:
            prenom, nom = split_name(leader_match.group(1))
            contacts.append(
                Contact(
                    umr=umr or "—",
                    nom_unite=meta.get("nom_unite", unit_name or "Institut Curie"),
                    prenom=prenom,
                    nom=nom,
                    role="Chef d'équipe",
                    role_tier="A",
                    equipe=team_name,
                    sujet_recherche=merge_topics(team_name, meta.get("themes", "")),
                    ville=meta.get("ville", "Paris"),
                    delegation_inserm=meta.get("delegation_inserm", "est"),
                    score_fit_lina=meta.get("score_fit_lina", "8"),
                    source_url=team_url,
                )
            )
        return contacts

    for path in person_paths:
        person_url = urljoin(CURIE_BASE, path)
        pdata = fetch_person(person_url)
        prenom, nom = split_name(pdata["full_name"])
        role = pdata["role"] or "Chercheur"
        if not should_include_role(role):
            continue
        contacts.append(
            Contact(
                umr=umr or "—",
                nom_unite=meta.get("nom_unite", pdata["unite"] or unit_name or "Institut Curie"),
                prenom=prenom,
                nom=nom,
                role=role,
                role_tier=infer_role_tier(role),
                equipe=pdata["equipe"] or team_name,
                sujet_recherche=merge_topics(pdata["bio"], team_name, meta.get("themes", "")),
                email=pdata["email"],
                linkedin_url=pdata["linkedin"],
                linkedin_source="site" if pdata["linkedin"] else "",
                linkedin_confidence="high" if pdata["linkedin"] else "",
                ville=meta.get("ville", "Paris"),
                delegation_inserm=meta.get("delegation_inserm", "est"),
                score_fit_lina=meta.get("score_fit_lina", "8"),
                source_url=person_url,
            )
        )
    return contacts


def scrape_all_curie(
    meta: Optional[dict] = None,
    checkpoint: Optional[dict] = None,
) -> list[Contact]:
    meta = meta or {
        "nom_unite": "Institut Curie",
        "ville": "Paris",
        "delegation_inserm": "est",
        "score_fit_lina": "8",
        "themes": "oncologie;immunologie",
    }
    done_teams: set[str] = set()
    if checkpoint:
        done_teams = set(checkpoint.get("curie_teams_done", []))

    all_contacts: list[Contact] = []
    if checkpoint and checkpoint.get("curie_contacts"):
        all_contacts = [Contact(**row) for row in checkpoint["curie_contacts"]]

    for team_url, _, _ in list_team_urls():
        if team_url in done_teams:
            continue
        team_contacts = scrape_team(team_url, meta=meta)
        all_contacts.extend(team_contacts)
        done_teams.add(team_url)
        if checkpoint is not None:
            checkpoint["curie_teams_done"] = sorted(done_teams)
            checkpoint["curie_contacts"] = [c.to_row() for c in all_contacts]
            # Persist after each team page (UI crawl progress)
            ckpt_path = Path(__file__).resolve().parents[2] / "data" / "checkpoints" / "lina-umr-scrape.json"
            if ckpt_path.parent.exists() or True:
                ckpt_path.parent.mkdir(parents=True, exist_ok=True)
                existing = {}
                if ckpt_path.exists():
                    existing = json.loads(ckpt_path.read_text())
                existing["curie_teams_done"] = checkpoint["curie_teams_done"]
                existing["curie_contacts"] = checkpoint["curie_contacts"]
                ckpt_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
    return all_contacts
