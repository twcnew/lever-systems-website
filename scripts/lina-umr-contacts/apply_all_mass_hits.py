#!/usr/bin/env python3
"""Applique tous les fichiers mass-li-hits-*.json et affiche la couverture."""
from __future__ import annotations

import csv
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CKPT = ROOT / "data" / "checkpoints"
SCRIPT = Path(__file__).resolve().parent / "apply_enrich_batch.py"


def coverage() -> dict:
    rows = list(csv.DictReader((ROOT / "data" / "lina-umr-contacts.csv").open()))
    n = len(rows)
    li = sum(1 for r in rows if r.get("linkedin_url"))
    em = sum(1 for r in rows if r.get("email"))
    either = sum(1 for r in rows if r.get("linkedin_url") or r.get("email"))
    return {"total": n, "linkedin": li, "email": em, "either": either, "pct": round(100 * either / n, 1)}


def main() -> None:
    files = sorted(CKPT.glob("mass-li-hits*.json"))
    if not files:
        print("Aucun fichier mass-li-hits*.json")
        sys.exit(1)
    for path in files:
        print(f"Applying {path.name}…")
        subprocess.run([sys.executable, str(SCRIPT), str(path)], check=False)
    stats = coverage()
    print(f"Coverage: {stats['either']}/{stats['total']} ({stats['pct']}%) | LI {stats['linkedin']} | email {stats['email']}")


if __name__ == "__main__":
    main()
