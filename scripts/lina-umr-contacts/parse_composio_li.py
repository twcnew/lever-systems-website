#!/usr/bin/env python3
"""Parse résultats Composio multi-execute → hits LinkedIn validés."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import slugify_name

AFF = (
    "inserm",
    "cnrs",
    "curie",
    "institut curie",
    "imrb",
    "mondor",
    "cesp",
    "u-pec",
    "creteil",
    "villejuif",
    "cancer",
    "immunit",
    "research",
    "chercheur",
    "phd",
    "doctorant",
    "post-doc",
    "universite",
    "sorbonne",
    "aphp",
    "gustave",
)


def linkedin_valid(url: str, prenom: str, nom: str, title: str = "", answer: str = "") -> tuple[bool, str]:
    if not url or "/company/" in url.lower():
        return False, ""
    slug = url.rsplit("/", 1)[-1].lower()
    nom_slug = slugify_name(nom)
    prenom_slug = slugify_name(prenom.split()[0] if prenom else "")
    if not nom_slug or nom_slug not in slug:
        return False, ""
    blob = f"{title} {answer}".lower()
    if not any(a in blob for a in AFF):
        return False, ""
    conf = "high" if prenom_slug and prenom_slug in slug else "medium"
    return True, conf


def parse_multi_execute(payload: dict, contacts: list[dict]) -> list[dict]:
    hits: list[dict] = []
    results = payload.get("results") or payload.get("data", {}).get("results") or []
    for i, item in enumerate(results):
        if i >= len(contacts):
            break
        c = contacts[i]
        data = item.get("response", {}).get("data", {})
        answer = data.get("answer", "")
        best = None
        for cit in data.get("citations", []):
            url = cit.get("url", "")
            if "linkedin.com/in" not in url:
                continue
            ok, conf = linkedin_valid(url, c["prenom"], c["nom"], cit.get("title", ""), answer)
            if ok:
                hit = {
                    "prenom": c["prenom"],
                    "nom": c["nom"],
                    "url": url.split("?")[0].rstrip("/"),
                    "confidence": conf,
                    "source": "search",
                }
                if conf == "high":
                    best = hit
                    break
                best = hit
        if best:
            hits.append(best)
    return hits


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: parse_composio_li.py batch.json composio_response.json [out.json]")
        sys.exit(1)
    batch = json.loads(Path(sys.argv[1]).read_text())
    payload = json.loads(Path(sys.argv[2]).read_text())
    contacts = batch["contacts"]
    hits = parse_multi_execute(payload, contacts)
    out = Path(sys.argv[3]) if len(sys.argv) > 3 else None
    if out:
        existing = json.loads(out.read_text()) if out.exists() else []
        seen = {(h["prenom"].lower(), h["nom"].lower()) for h in existing}
        for h in hits:
            k = (h["prenom"].lower(), h["nom"].lower())
            if k not in seen:
                existing.append(h)
                seen.add(k)
        out.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
        print(f"Saved {len(hits)} new hits ({len(existing)} total) → {out}")
    else:
        print(json.dumps(hits, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
