#!/usr/bin/env python3
"""Apply all LinkedIn chunk checkpoints to raw CSV -> final output."""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from models import CSV_FIELDS, Contact
from scrape import write_csv, write_report

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "lina-umr-contacts-raw.csv"
OUT = ROOT / "data" / "lina-umr-contacts.csv"
CKPT_DIR = ROOT / "data" / "checkpoints"


def main() -> None:
    contacts: list[Contact] = []
    with RAW.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))

    merged_cache: dict = {}
    for ckpt in sorted(CKPT_DIR.glob("lina-umr-linkedin-chunk*.json")):
        data = json.loads(ckpt.read_text())
        merged_cache.update(data)
    main_ckpt = CKPT_DIR / "lina-umr-linkedin.json"
    if main_ckpt.exists():
        merged_cache.update(json.loads(main_ckpt.read_text()))

    for c in contacts:
        if c.linkedin_url:
            continue
        hit = merged_cache.get(c.dedup_key())
        if hit and hit.get("url"):
            c.linkedin_url = hit["url"]
            c.linkedin_source = "search"
            c.linkedin_confidence = hit.get("confidence", "")

    write_csv(OUT, contacts)
    write_report(contacts)
    with_li = sum(1 for c in contacts if c.linkedin_url)
    with_email = sum(1 for c in contacts if c.email)
    print(f"Final: {len(contacts)} contacts, {with_li} LinkedIn, {with_email} emails -> {OUT}")


if __name__ == "__main__":
    main()
