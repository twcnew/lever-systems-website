#!/usr/bin/env python3
"""Append validated LinkedIn hits to mass-li-hits-N.json."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_enrich_batch_a import linkedin_valid


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("hits_json")
    parser.add_argument("new_hits_json", help="JSON list of {prenom,nom,lab,url?,confidence?}")
    args = parser.parse_args()

    path = Path(args.hits_json)
    existing = json.loads(path.read_text()) if path.exists() else []
    done = {(h["prenom"], h["nom"]) for h in existing}
    new = json.loads(Path(args.new_hits_json).read_text())

    added = 0
    for h in new:
        key = (h["prenom"], h["nom"])
        if key in done:
            continue
        url = (h.get("url") or "").split("?")[0].rstrip("/")
        conf = h.get("confidence", "")
        lab = h.get("lab", "")
        if url:
            ok, conf = linkedin_valid(url, h["prenom"], h["nom"], lab)
            if not ok:
                url, conf = "", ""
        hit = {
            "prenom": h["prenom"],
            "nom": h["nom"],
            "confidence": conf,
            "source": "search",
            "url": url,
        }
        existing.append(hit)
        done.add(key)
        added += 1

    path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
    found = sum(1 for h in existing if h.get("url"))
    print(f"Added {added}, total {len(existing)}, found {found}")


if __name__ == "__main__":
    main()
