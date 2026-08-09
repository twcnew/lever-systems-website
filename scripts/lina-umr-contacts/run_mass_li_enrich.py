#!/usr/bin/env python3
"""Enrichissement LinkedIn massif depuis mass-li-*.json."""
from __future__ import annotations

import argparse
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

from utils import LINKEDIN_RE, extract_linkedin_urls, normalize_space, slugify_name

ROOT = Path(__file__).resolve().parents[2]

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

AFFILIATION_KEYWORDS = (
    "inserm",
    "cnrs",
    "curie",
    "institut curie",
    "imrb",
    "cesp",
    "mondor",
    "villejuif",
    "gustave roussy",
    "u1160",
    "irsl",
    "immunité",
    "immunite",
    "cancer",
    "créteil",
    "creteil",
)

SEARCH_ENGINES = [
    "https://search.brave.com/search?",
    "https://html.duckduckgo.com/html/?",
]


def norm(s: str) -> str:
    return (s or "").strip().lower()


def strip_accents(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    return "".join(c for c in text if not unicodedata.combining(c))


def linkedin_valid(url: str, prenom: str, nom: str) -> tuple[bool, str]:
    if not url or "/company/" in url.lower():
        return False, ""
    slug = url.rsplit("/", 1)[-1].lower()
    nom_slug = slugify_name(nom)
    prenom_slug = slugify_name(prenom.split()[0] if prenom else "")
    if nom_slug and nom_slug in slug:
        conf = "high" if prenom_slug and prenom_slug in slug else "medium"
        return True, conf
    return False, ""


def affiliation_valid(text: str, lab: str) -> bool:
    text = strip_accents(text.lower())
    lab_norm = strip_accents(lab.lower())
    if lab_norm and any(part in text for part in lab_norm.split() if len(part) > 3):
        return True
    return any(k in text for k in AFFILIATION_KEYWORDS)


def linkedin_title_valid(html: str, prenom: str, nom: str, lab: str) -> tuple[bool, str]:
    text = strip_accents(html.lower())
    full = strip_accents(normalize_space(f"{prenom} {nom}").lower())
    name_ok = all(part in text for part in full.split() if len(part) > 2)
    if not name_ok:
        return False, ""
    if affiliation_valid(text, lab):
        return True, "medium"
    return False, ""


def web_search(query: str, delay: float = 1.8) -> str:
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


def collect_links(html: str) -> list[str]:
    links = extract_linkedin_urls(html)
    soup = BeautifulSoup(html, "lxml")
    for a in soup.select("a[href]"):
        href = a.get("href", "")
        if "uddg=" in href:
            parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
            href = parsed.get("uddg", [href])[0]
        links.extend(extract_linkedin_urls(href))
    return list(dict.fromkeys(links))


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
        for href in collect_links(html):
            href = href.split("?")[0].rstrip("/")
            ok, conf = linkedin_valid(href, prenom, nom)
            if ok:
                idx = html.lower().find(href.lower().rsplit("/", 1)[-1])
                snippet = html[max(0, idx - 300) : idx + 500] if idx >= 0 else html[:1000]
                if affiliation_valid(snippet, lab) or conf == "high":
                    if conf == "high":
                        return href, conf
                    if not best_url or best_conf != "high":
                        best_url, best_conf = href, conf
            else:
                idx = html.lower().find(href.lower().rsplit("/", 1)[-1])
                snippet = html[max(0, idx - 300) : idx + 500] if idx >= 0 else html[:1000]
                tok, conf = linkedin_title_valid(snippet, prenom, nom, lab)
                if tok and (not best_url or conf == "medium"):
                    best_url, best_conf = href, conf
        if best_conf == "high":
            return best_url, best_conf
    return best_url, best_conf


def try_curie_page(prenom: str, nom: str) -> tuple[str, str]:
    slug = slugify_name(f"{prenom}-{nom}")
    url = f"https://curie.fr/personne/{slug}"
    try:
        time.sleep(0.8)
        resp = SESSION.get(url, timeout=20)
        if resp.status_code != 200:
            return "", ""
        soup = BeautifulSoup(resp.text, "lxml")
        title = soup.title.string if soup.title else ""
        if nom.lower() not in (title or "").lower():
            return "", ""
        for u in extract_linkedin_urls(soup):
            ok, c = linkedin_valid(u, prenom, nom)
            if ok:
                return u.split("?")[0].rstrip("/"), c or "high"
    except requests.RequestException:
        pass
    return "", ""


def enrich_contact(c: dict) -> dict | None:
    prenom, nom, lab = c["prenom"], c["nom"], c["lab"]
    url, conf = "", ""

    if "curie" in lab.lower() or lab == "Immunité et Cancer":
        url, conf = try_curie_page(prenom, nom)

    if not url:
        url, conf = search_linkedin(prenom, nom, lab)

    if not url:
        return None
    return {
        "prenom": prenom,
        "nom": nom,
        "url": url,
        "confidence": conf or "medium",
        "source": "search",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("queue_json")
    parser.add_argument("out_json")
    parser.add_argument("--delay", type=float, default=1.5)
    args = parser.parse_args()

    queue_path = Path(args.queue_json)
    out_path = Path(args.out_json)
    queue = json.loads(queue_path.read_text())

    results: list[dict] = []
    if out_path.exists():
        results = json.loads(out_path.read_text())

    done = {(norm(r["prenom"]), norm(r["nom"])) for r in results}
    print(f"Queue: {len(queue)}, hits: {len(results)}, remaining: {len(queue) - len(done)}")

    for i, c in enumerate(queue):
        key = (norm(c["prenom"]), norm(c["nom"]))
        if key in done:
            continue
        print(f"[{i+1}/{len(queue)}] {c['prenom']} {c['nom']} ({c['lab']}) …", flush=True)
        hit = enrich_contact(c)
        if hit:
            results.append(hit)
            print(f"  -> {hit['url']} ({hit['confidence']})", flush=True)
        else:
            print("  -> rien", flush=True)
        out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        done.add(key)

    print(f"\nSaved {len(results)} hits to {out_path}")


if __name__ == "__main__":
    main()
