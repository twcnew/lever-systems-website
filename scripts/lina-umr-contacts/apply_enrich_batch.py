#!/usr/bin/env python3
"""Applique un lot d'enrichissements LinkedIn et/ou email."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "lina-umr-contacts.csv"
CKPT = ROOT / "data" / "checkpoints" / "lina-umr-enrich.json"
EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
GENERIC = ("contact@", "info@", "secretariat@", "accueil@", "webmaster@")


def norm(s: str) -> str:
    return (s or "").strip().lower()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch_json")
    args = parser.parse_args()

    hits = json.loads(Path(args.batch_json).read_text())
    contacts: list[Contact] = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))

    ckpt = json.loads(CKPT.read_text()) if CKPT.exists() else {"linkedin": {}, "email": {}}
    applied_li = applied_em = 0

    for hit in hits:
        prenom, nom = norm(hit.get("prenom", "")), norm(hit.get("nom", ""))
        url = (hit.get("url") or hit.get("linkedin_url") or "").split("?")[0].rstrip("/")
        email = norm(hit.get("email", ""))
        if email and not EMAIL_RE.match(email):
            email = ""
        if email and any(email.startswith(g) for g in GENERIC):
            email = ""

        for c in contacts:
            if norm(c.prenom) != prenom or norm(c.nom) != nom:
                continue
            key = c.dedup_key()
            if url and not c.linkedin_url:
                c.linkedin_url = url
                c.linkedin_source = hit.get("source", "search")
                c.linkedin_confidence = hit.get("confidence", "medium")
                ckpt.setdefault("linkedin", {})[key] = {
                    "url": url,
                    "confidence": c.linkedin_confidence,
                }
                applied_li += 1
            if email and not c.email:
                c.email = email
                ckpt.setdefault("email", {})[key] = email
                applied_em += 1

    CKPT.write_text(json.dumps(ckpt, ensure_ascii=False, indent=2))
    write_csv(CSV_PATH, contacts)
    write_report(contacts)
    print(f"Applied: {applied_li} LinkedIn, {applied_em} emails (from {len(hits)} hits)")


if __name__ == "__main__":
    main()
