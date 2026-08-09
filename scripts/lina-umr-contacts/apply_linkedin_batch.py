#!/usr/bin/env python3
"""Applique un lot de LinkedIn trouvés manuellement / via WebSearch."""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "lina-umr-contacts.csv"
CKPT = ROOT / "data" / "checkpoints" / "lina-umr-enrich.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch_json", help="JSON list of {prenom,nom,url,confidence}")
    args = parser.parse_args()

    hits = json.loads(Path(args.batch_json).read_text())
    contacts = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))

    ckpt = json.loads(CKPT.read_text()) if CKPT.exists() else {"linkedin": {}}
    applied = 0
    for hit in hits:
        url = (hit.get("url") or "").split("?")[0].rstrip("/")
        if not url:
            continue
        prenom = hit.get("prenom", "").strip().lower()
        nom = hit.get("nom", "").strip().lower()
        conf = hit.get("confidence", "medium")
        for c in contacts:
            if c.prenom.strip().lower() == prenom and c.nom.strip().lower() == nom:
                if not c.linkedin_url:
                    c.linkedin_url = url
                    c.linkedin_source = "search"
                    c.linkedin_confidence = conf
                    applied += 1
                ckpt.setdefault("linkedin", {})[c.dedup_key()] = {"url": url, "confidence": conf}

    CKPT.write_text(json.dumps(ckpt, ensure_ascii=False, indent=2))
    write_csv(CSV_PATH, contacts)
    write_report(contacts)
    print(f"Applied {applied} LinkedIn URLs from {len(hits)} hits")


if __name__ == "__main__":
    main()
