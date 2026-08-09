#!/usr/bin/env python3
"""Merge parallel batch CSVs into final contacts file."""
from __future__ import annotations

import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from models import CSV_FIELDS, Contact
from scrape import dedupe, write_csv, write_report

ROOT = Path(__file__).resolve().parents[2]
BATCH_DIR = ROOT / "data" / "batches"
OUT = ROOT / "data" / "lina-umr-contacts-raw.csv"


def main() -> None:
    contacts: list[Contact] = []
    for path in sorted(BATCH_DIR.glob("*.csv")):
        with path.open(newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))
        print(f"Loaded {path.name}")
    merged = dedupe(contacts)
    write_csv(OUT, merged)
    write_report(merged)
    print(f"Merged {len(merged)} contacts -> {OUT}")


if __name__ == "__main__":
    main()
