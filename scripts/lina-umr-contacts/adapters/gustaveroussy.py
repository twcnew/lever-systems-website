from __future__ import annotations

import re
from urllib.parse import urljoin

from http_client import fetch_soup
from models import Contact
from utils import (
    extract_emails,
    extract_linkedin_urls,
    infer_role_tier,
    merge_topics,
    normalize_space,
    split_name,
)

GR_BASE = "https://www.gustaveroussy.fr"
_seen_teams: set[str] = set()


def scrape_teams_listing(meta: dict) -> list[Contact]:
    contacts: list[Contact] = []
    for page in range(0, 20):
        url = f"{GR_BASE}/fr/equipes-de-recherche" + (f"?page={page}" if page else "")
        soup = fetch_soup(url)
        if not soup:
            break
        blocks = re.split(r"Responsable\s*:", str(soup), flags=re.I)
        if len(blocks) <= 1:
            break
        added = 0
        for block in blocks[1:]:
            leader_line = normalize_space(block.split("Axe de recherche", 1)[0])
            leader_line = leader_line.split("Unité", 1)[0].strip(" :")
            if not leader_line:
                continue
            leaders = [normalize_space(x) for x in re.split(r"/|,", leader_line) if normalize_space(x)]
            axe = ""
            unit = ""
            m_axe = re.search(r"Axe de recherche:\s*</?[^>]*>\s*([^<]+)", block, re.I)
            if m_axe:
                axe = normalize_space(m_axe.group(1))
            m_unit = re.search(r"Unité:\s*</?[^>]*>\s*([^<]+)", block, re.I)
            if m_unit:
                unit = normalize_space(m_unit.group(1))
            umr_match = re.search(r"UMR\s*(\d+)", unit, re.I)
            umr = umr_match.group(1) if umr_match else meta.get("umr", "—")
            team_title = ""
            m_title = re.search(r"<h\d[^>]*>([^<]+)</h\d>", block)
            if m_title:
                team_title = normalize_space(m_title.group(1))
            key = f"{team_title}|{leader_line}"
            if key in _seen_teams:
                continue
            _seen_teams.add(key)
            added += 1
            for leader in leaders:
                prenom, nom = split_name(leader)
                contacts.append(
                    Contact(
                        umr=umr,
                        nom_unite=unit or meta.get("nom_unite", "Gustave Roussy"),
                        prenom=prenom,
                        nom=nom,
                        role="Chef d'équipe",
                        role_tier="A",
                        equipe=team_title,
                        sujet_recherche=merge_topics(axe, team_title, meta.get("themes", "")),
                        ville=meta.get("ville", "Villejuif"),
                        delegation_inserm=meta.get("delegation_inserm", "sud"),
                        score_fit_lina=meta.get("score_fit_lina", "9"),
                        source_url=url,
                    )
                )
        if added == 0:
            break
    return contacts
