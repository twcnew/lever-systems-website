from __future__ import annotations

import re

from http_client import fetch_soup
from models import Contact
from utils import infer_role_tier, merge_topics, normalize_space, split_name

PARIS_CITE_URL = "https://u-paris.fr/sante/laboratoires/"
_cache: dict[str, dict] = {}


def _load_labs() -> dict[str, dict]:
    global _cache
    if _cache:
        return _cache
    soup = fetch_soup(PARIS_CITE_URL)
    if not soup:
        return {}
    text = str(soup)
    chunks = re.split(r"<h5[^>]*>", text, flags=re.I)
    for chunk in chunks[1:]:
        title_match = re.search(r"([^<]+)</h5>", chunk)
        if not title_match:
            continue
        title = normalize_space(title_match.group(1))
        umr_match = re.search(r"UMR[\s\-]*(?:S\s*)?(\d+)", title, re.I)
        if not umr_match:
            continue
        umr = umr_match.group(1)
        director = ""
        dir_match = re.search(r"Directeur(?:rice)?\s*:\s*([^<\n]+)", chunk, re.I)
        if dir_match:
            director = normalize_space(dir_match.group(1))
        site_match = re.search(r'href="([^"]+)"[^>]*>\s*Site internet', chunk, re.I)
        site = site_match.group(1) if site_match else ""
        desc_match = re.search(r"</h5>\s*<p[^>]*>([^<]+)", chunk, re.I)
        desc = normalize_space(desc_match.group(1)) if desc_match else ""
        _cache[umr] = {
            "title": title,
            "director": director,
            "site": site,
            "description": desc,
        }
    return _cache


def lookup_umr(umr: str) -> dict:
    labs = _load_labs()
    return labs.get(str(umr).strip(), {})


def contacts_for_umr(umr: str, meta: dict) -> list[Contact]:
    info = lookup_umr(umr)
    if not info:
        return []
    contacts: list[Contact] = []
    if info.get("director"):
        prenom, nom = split_name(info["director"])
        contacts.append(
            Contact(
                umr=umr,
                nom_unite=info.get("title") or meta.get("nom_unite", ""),
                prenom=prenom,
                nom=nom,
                role="Directeur/Directrice d'unité",
                role_tier="A",
                equipe="",
                sujet_recherche=merge_topics(info.get("description", ""), meta.get("themes", "")),
                ville=meta.get("ville", ""),
                delegation_inserm=meta.get("delegation_inserm", ""),
                score_fit_lina=meta.get("score_fit_lina", ""),
                source_url=PARIS_CITE_URL,
            )
        )
    return contacts
