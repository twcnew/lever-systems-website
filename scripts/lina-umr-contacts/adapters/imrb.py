from __future__ import annotations

import re
from typing import Optional
from urllib.parse import urljoin

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
    table_rows,
    text_after_heading,
)

IMRB_BASE = "https://imrb.inserm.fr"
_team_topics: dict[str, str] = {}


def _load_team_topics() -> dict[str, str]:
    if _team_topics:
        return _team_topics
    soup = fetch_soup(f"{IMRB_BASE}/equipes/")
    if soup:
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "/equipes/" not in href:
                continue
            label = normalize_space(a.get_text(" ", strip=True))
            if label:
                slug = href.rstrip("/").split("/")[-1]
                _team_topics[slug] = label
    return _team_topics


def scrape_annuaire(meta: dict) -> list[Contact]:
    soup = fetch_soup(f"{IMRB_BASE}/annuaire/")
    if not soup:
        return []
    topics = _load_team_topics()
    contacts: list[Contact] = []
    for row in table_rows(soup):
        if len(row) < 5:
            continue
        # Lignes alphabétiques géantes (lettre + blob) — ignorer
        if len(row) > 8 and row[0] in list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
            continue
        if row[0] not in ("", "Nom"):
            continue
        if row[1].lower() in {"nom", "name", "prénom", "prenom"}:
            continue
        nom, prenom, role = row[1], row[2], row[3]
        team = row[5] if len(row) > 5 else ""
        if not should_include_role(role):
            continue
        team_key = team.split(",")[0].strip().lower()
        topic = ""
        for slug, title in topics.items():
            if slug in team_key or title.lower() in team.lower():
                topic = title
                break
        contacts.append(
            Contact(
                umr=meta.get("umr", "955"),
                nom_unite=meta.get("nom_unite", "IMRB"),
                prenom=prenom,
                nom=nom,
                role=role,
                role_tier=infer_role_tier(role),
                equipe=team,
                sujet_recherche=merge_topics(topic, meta.get("themes", "")),
                ville=meta.get("ville", "Créteil"),
                delegation_inserm=meta.get("delegation_inserm", "est"),
                score_fit_lina=meta.get("score_fit_lina", "10"),
                source_url=f"{IMRB_BASE}/annuaire/",
            )
        )
    return contacts


def scrape_equipe_page(url: str, meta: dict) -> list[Contact]:
    soup = fetch_soup(url)
    if not soup:
        return []
    contacts: list[Contact] = []
    team_name = ""
    h1 = soup.find("h1")
    if h1:
        team_name = normalize_space(h1.get_text())
    topic = merge_topics(
        text_after_heading(soup, ["Présentation", "Presentation", "Objectifs"]),
        team_name,
        meta.get("themes", ""),
    )
    emails = extract_emails(soup)
    linkedins = extract_linkedin_urls(soup)

    for tag in soup.find_all(["h2", "h3", "h4", "strong", "p", "li"]):
        text = normalize_space(tag.get_text(" ", strip=True))
        if re.match(r"^(Dr|Pr|Prof|Dr\.|Pr\.)", text):
            prenom, nom = split_name(re.sub(r"^(Dr|Pr|Prof)\.?\s*", "", text, flags=re.I))
            contacts.append(
                Contact(
                    umr=meta.get("umr", "955"),
                    nom_unite=meta.get("nom_unite", "IMRB"),
                    prenom=prenom,
                    nom=nom,
                    role="Chercheur",
                    role_tier=infer_role_tier("chercheur"),
                    equipe=team_name,
                    sujet_recherche=topic,
                    email=emails[0] if emails else "",
                    linkedin_url=linkedins[0] if linkedins else "",
                    linkedin_source="site" if linkedins else "",
                    linkedin_confidence="high" if linkedins else "",
                    ville=meta.get("ville", "Créteil"),
                    delegation_inserm=meta.get("delegation_inserm", "est"),
                    score_fit_lina=meta.get("score_fit_lina", "10"),
                    source_url=url,
                )
            )

    if not contacts and team_name:
        slug = url.rstrip("/").split("/")[-1]
        leader = slug.split("-")[-1] if "-" in slug else ""
        if leader:
            contacts.append(
                Contact(
                    umr=meta.get("umr", "955"),
                    nom_unite=meta.get("nom_unite", "IMRB"),
                    prenom="",
                    nom=leader.capitalize(),
                    role="Chef d'équipe",
                    role_tier="A",
                    equipe=team_name,
                    sujet_recherche=topic,
                    ville=meta.get("ville", "Créteil"),
                    delegation_inserm=meta.get("delegation_inserm", "est"),
                    score_fit_lina=meta.get("score_fit_lina", "10"),
                    source_url=url,
                )
            )
    return contacts
