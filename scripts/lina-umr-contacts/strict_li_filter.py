#!/usr/bin/env python3
"""Filtre strict des hits LinkedIn."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import slugify_name

AFF = (
    "inserm", "cnrs", "curie", "institut curie", "imrb", "mondor", "cesp",
    "u-pec", "creteil", "villejuif", "cancer", "immunit", "research",
    "chercheur", "phd", "doctorant", "post-doc", "universite", "sorbonne", "aphp",
)


def norm(s: str) -> str:
    t = unicodedata.normalize("NFKD", s or "")
    t = "".join(c for c in t if not unicodedata.combining(c))
    return t.lower().strip()


def strict_hit(hit: dict) -> bool:
    prenom, nom, url = hit["prenom"], hit["nom"], hit["url"]
    slug = url.rsplit("/", 1)[-1].lower()
    nom_slug = slugify_name(nom)
    prenom_slug = slugify_name(prenom.split()[0] if prenom else "")
    if not nom_slug or nom_slug not in slug:
        return False
    # Require prenom evidence in slug OR both names in slug parts
    if prenom_slug and len(prenom_slug) > 2:
        if prenom_slug not in slug and not slug.startswith(nom_slug):
            # allow "cohenjose" style
            if not (nom_slug in slug and prenom_slug[:4] in slug):
                return False
    conf = hit.get("confidence", "")
    return conf in ("high", "medium")


def main() -> None:
    hits = json.loads(Path(sys.argv[1]).read_text())
    out = [h for h in hits if strict_hit(h)]
    Path(sys.argv[2]).write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(len(hits), "->", len(out))


if __name__ == "__main__":
    main()
