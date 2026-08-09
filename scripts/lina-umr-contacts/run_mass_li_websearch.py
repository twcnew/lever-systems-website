#!/usr/bin/env python3
"""Mass LinkedIn search via duckduckgo-search (fallback when Brave/Bing scrape fails)."""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from run_enrich_batch_a import linkedin_valid, linkedin_title_valid

try:
    from ddgs import DDGS
except ImportError:
    from duckduckgo_search import DDGS  # type: ignore

ROOT = Path(__file__).resolve().parents[2]


def search_one(prenom: str, nom: str, lab: str) -> tuple[str, str]:
    full = f"{prenom} {nom}".strip()
    queries = [
        f"{full} {lab} site:linkedin.com/in",
        f"site:linkedin.com/in {full} Inserm",
        f"site:linkedin.com/in {nom} {lab}",
    ]
    best_url, best_conf = "", ""
    with DDGS() as ddgs:
        for q in queries:
            try:
                for r in ddgs.text(q, max_results=8):
                    href = (r.get("href") or "").split("?")[0].rstrip("/")
                    if "linkedin.com/in/" not in href.lower():
                        continue
                    ok, conf = linkedin_valid(href, prenom, nom, lab)
                    if ok:
                        if conf == "high":
                            return href, conf
                        if not best_url:
                            best_url, best_conf = href, conf
                    body = (r.get("body") or "") + " " + (r.get("title") or "")
                    tok, conf = linkedin_title_valid(body, prenom, nom, lab)
                    if tok and href and (not best_url or conf == "medium"):
                        best_url, best_conf = href, conf
            except Exception:
                continue
            time.sleep(0.3)
    return best_url, best_conf


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("queue_json")
    parser.add_argument("hits_json")
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()

    queue = json.loads(Path(args.queue_json).read_text())
    hits_path = Path(args.hits_json)
    done: dict[str, dict] = {}
    if args.resume and hits_path.exists():
        for h in json.loads(hits_path.read_text()):
            done[f"{h['prenom']}|{h['nom']}"] = h

    hits = list(done.values())
    found = sum(1 for h in hits if h.get("url"))

    for i, c in enumerate(queue):
        key = f"{c['prenom']}|{c['nom']}"
        if key in done:
            continue
        prenom, nom, lab = c["prenom"], c["nom"], c.get("lab", "")
        url, conf = search_one(prenom, nom, lab)
        hit = {
            "prenom": prenom,
            "nom": nom,
            "confidence": conf or "",
            "source": "search",
            "url": url or "",
        }
        if url:
            found += 1
        hits.append(hit)
        done[key] = hit

        if (i + 1) % 5 == 0:
            hits_path.write_text(json.dumps(hits, ensure_ascii=False, indent=2))
            print(f"[{i+1}/{len(queue)}] found={found}", flush=True)

    hits_path.write_text(json.dumps(hits, ensure_ascii=False, indent=2))
    print(f"Done: {found}/{len(queue)} -> {hits_path}", flush=True)


if __name__ == "__main__":
    main()
