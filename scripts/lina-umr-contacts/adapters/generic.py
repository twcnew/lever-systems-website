from __future__ import annotations

import re
from typing import Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from http_client import fetch, fetch_soup
from models import Contact
from utils import (
    collect_links,
    extract_emails,
    extract_linkedin_urls,
    infer_role_tier,
    merge_topics,
    normalize_space,
    should_include_role,
    split_name,
    table_rows,
    text_after_heading,
)

TEAM_PATTERNS = [
    r"/equipe",
    r"/equipes",
    r"/team",
    r"/teams",
    r"/groupe",
    r"/groupes",
    r"/research-team",
    r"/laboratoire",
    r"/laboratory",
]
MEMBER_PATTERNS = [
    r"/personne",
    r"/people",
    r"/membre",
    r"/member",
    r"/annuaire",
    r"/staff",
    r"/chercheur",
]


def _is_relevant_link(base: str, link: str) -> bool:
    full = urljoin(base, link)
    if urlparse(full).netloc != urlparse(base).netloc:
        return False
    low = link.lower()
    return any(re.search(p, low) for p in TEAM_PATTERNS + MEMBER_PATTERNS)


def scrape_generic_site(
    site_url: str,
    meta: dict,
    teams_url: str = "",
    max_pages: int = 40,
) -> list[Contact]:
    contacts: list[Contact] = []
    visited: set[str] = set()
    queue = [teams_url or site_url]
    pages = 0

    while queue and pages < max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        pages += 1
        soup = fetch_soup(url)
        if not soup:
            continue

        topic = merge_topics(
            text_after_heading(soup, ["Présentation", "Presentation", "Research", "Axes"]),
            meta.get("themes", ""),
            meta.get("nom_unite", ""),
        )

        for row in table_rows(soup):
            if len(row) >= 3 and row[0].lower() not in {"nom", "name"}:
                if row[0].lower() in {"nom", "name"}:
                    continue
                # IMRB-like or generic table
                if re.match(r"^[A-ZÀ-ÖØ-Ý' -]+$", row[0]) and row[1] and row[2]:
                    nom, prenom, role = row[0], row[1], row[2]
                    equipe = row[3] if len(row) > 3 else ""
                    if not should_include_role(role):
                        continue
                    contacts.append(
                        Contact(
                            umr=meta.get("umr", "—"),
                            nom_unite=meta.get("nom_unite", ""),
                            prenom=prenom,
                            nom=nom,
                            role=role,
                            role_tier=infer_role_tier(role),
                            equipe=equipe,
                            sujet_recherche=topic,
                            email=extract_emails(soup)[0] if extract_emails(soup) else "",
                            ville=meta.get("ville", ""),
                            delegation_inserm=meta.get("delegation_inserm", ""),
                            score_fit_lina=meta.get("score_fit_lina", ""),
                            source_url=url,
                        )
                    )

        emails = extract_emails(soup)
        linkedins = extract_linkedin_urls(soup)

        for tag in soup.find_all(["h2", "h3", "h4", "li", "p", "div"]):
            text = normalize_space(tag.get_text(" ", strip=True))
            if re.match(r"^(Dr|Pr|Prof|Directeur|Directrice|Chef d)", text, re.I) and 5 < len(text) < 80:
                name = re.sub(r"^(Dr|Pr|Prof|Directeur|Directrice|Chef d'équipe|Chef d'equipe)\s*:?\s*", "", text, flags=re.I)
                prenom, nom = split_name(name)
                if nom and len(nom) > 1:
                    role = "Chercheur"
                    if re.search(r"chef|directeur|directrice|responsable", text, re.I):
                        role = text.split(name)[0].strip(" :") or "Chef d'équipe"
                    contacts.append(
                        Contact(
                            umr=meta.get("umr", "—"),
                            nom_unite=meta.get("nom_unite", ""),
                            prenom=prenom,
                            nom=nom,
                            role=role,
                            role_tier=infer_role_tier(role),
                            equipe="",
                            sujet_recherche=topic,
                            email=emails[0] if emails else "",
                            linkedin_url=linkedins[0] if linkedins else "",
                            linkedin_source="site" if linkedins else "",
                            linkedin_confidence="high" if linkedins else "",
                            ville=meta.get("ville", ""),
                            delegation_inserm=meta.get("delegation_inserm", ""),
                            score_fit_lina=meta.get("score_fit_lina", ""),
                            source_url=url,
                        )
                    )

        for link in collect_links(soup, url, TEAM_PATTERNS + MEMBER_PATTERNS):
            if link not in visited and link not in queue:
                queue.append(link)

    return contacts
