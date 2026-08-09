#!/usr/bin/env python3
"""Parallel-friendly LinkedIn lookup for merged contacts CSV."""
from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lookup_linkedin import enrich_contacts_linkedin
from models import CSV_FIELDS, Contact
from scrape import write_csv

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "data" / "lina-umr-contacts-raw.csv"
OUTPUT = ROOT / "data" / "lina-umr-contacts.csv"
CHECKPOINT = ROOT / "data" / "checkpoints" / "lina-umr-linkedin.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=INPUT)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--checkpoint", type=Path, default=CHECKPOINT)
    parser.add_argument("--chunk", type=int, default=0)
    parser.add_argument("--chunks", type=int, default=1)
    parser.add_argument("--delay", type=float, default=2.5)
    parser.add_argument("--role-tier", type=str, default="")
    parser.add_argument("--min-score", type=int, default=0)
    args = parser.parse_args()

    contacts: list[Contact] = []
    with args.input.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            contacts.append(Contact(**{k: row.get(k, "") for k in CSV_FIELDS}))

    # Only lookup contacts missing LinkedIn, split by chunk
    need = [
        c
        for c in contacts
        if not c.linkedin_url
        and len((c.nom or "").strip()) >= 2
        and (not args.role_tier or c.role_tier == args.role_tier)
        and int(c.score_fit_lina or 0) >= args.min_score
    ]
    if args.chunks > 1:
        chunk_size = (len(need) + args.chunks - 1) // args.chunks
        start = args.chunk * chunk_size
        end = min(start + chunk_size, len(need))
        subset_keys = {need[i].dedup_key() for i in range(start, end)}
        to_lookup = [c for c in contacts if not c.linkedin_url and c.dedup_key() in subset_keys]
        ckpt = args.checkpoint.parent / f"{args.checkpoint.stem}-chunk{args.chunk}.json"
    else:
        to_lookup = need
        ckpt = args.checkpoint

    print(f"Chunk {args.chunk}/{args.chunks}: {len(to_lookup)} lookups", flush=True)

    # Patch delay
    import lookup_linkedin as ll

    orig = ll.search_linkedin

    def search_with_delay(*a, **kw):
        kw["delay"] = args.delay
        return orig(*a, **kw)

    ll.search_linkedin = search_with_delay
    enrich_contacts_linkedin(to_lookup, ckpt)

    import json

    cached = json.loads(ckpt.read_text()) if ckpt.exists() else {}
    for c in contacts:
        if c.linkedin_url:
            continue
        hit = cached.get(c.dedup_key())
        if hit and hit.get("url"):
            c.linkedin_url = hit["url"]
            c.linkedin_source = "search"
            c.linkedin_confidence = hit.get("confidence", "")

    if args.chunks == 1:
        write_csv(args.output, contacts)
        with_li = sum(1 for c in contacts if c.linkedin_url)
        print(f"Done: {with_li}/{len(contacts)} with LinkedIn -> {args.output}", flush=True)
    else:
        found = sum(1 for v in cached.values() if v.get("url"))
        print(f"Chunk {args.chunk} checkpoint: {found} found, {len(cached)} processed -> {ckpt}", flush=True)


if __name__ == "__main__":
    main()
