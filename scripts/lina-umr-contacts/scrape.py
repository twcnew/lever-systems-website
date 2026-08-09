#!/usr/bin/env python3
"""Scrape public lab websites (HTML UI only — no backend/API calls)."""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))

from adapters.curie import list_team_urls, scrape_all_curie
from adapters.generic import scrape_generic_site
from adapters.gustaveroussy import scrape_teams_listing
from adapters.imrb import scrape_annuaire, scrape_equipe_page
from adapters.paris_cite import contacts_for_umr, lookup_umr
from lookup_linkedin import enrich_contacts_linkedin
from models import CSV_FIELDS, Contact

ROOT = Path(__file__).resolve().parents[2]
UMR_CSV = ROOT / "data" / "lina-umr-websites.csv"
OUT_CSV = ROOT / "data" / "lina-umr-contacts.csv"
RAW_CSV = ROOT / "data" / "lina-umr-contacts-raw.csv"
CHECKPOINT = ROOT / "data" / "checkpoints" / "lina-umr-scrape.json"
LINKEDIN_CKPT = ROOT / "data" / "checkpoints" / "lina-umr-linkedin.json"
REPORT = ROOT / "data" / "lina-umr-contacts-report.md"

SKIP_TYPES = {
    "portail_offres",
    "document",
    "portail_reseau",
    "annuaire_national",
}

BATCH_FILTERS = {
    "curie": lambda r: "curie.fr" in (r.get("site_web") or ""),
    "imrb": lambda r: any(
        x in (r.get("site_web") or "")
        for x in ("imrb.inserm.fr", "irsl.u-paris.fr", "institut-recherche-saint-louis.fr")
    ),
    "gr": lambda r: "gustaveroussy.fr" in (r.get("site_web") or ""),
    "nord": lambda r: r.get("delegation_inserm") == "nord"
    and r.get("type_site") not in SKIP_TYPES
    and "curie.fr" not in (r.get("site_web") or "")
    and "imrb.inserm.fr" not in (r.get("site_web") or "")
    and "irsl.u-paris.fr" not in (r.get("site_web") or "")
    and "institut-recherche-saint-louis.fr" not in (r.get("site_web") or ""),
    "est": lambda r: r.get("delegation_inserm") == "est"
    and r.get("type_site") not in SKIP_TYPES
    and "curie.fr" not in (r.get("site_web") or "")
    and "imrb.inserm.fr" not in (r.get("site_web") or ""),
    "sud": lambda r: r.get("delegation_inserm") in ("sud", "idf", "france")
    and r.get("type_site") not in SKIP_TYPES
    and "gustaveroussy.fr" not in (r.get("site_web") or ""),
}


def filter_rows(rows: list[dict], batch: str | None) -> list[dict]:
    if not batch:
        return rows
    fn = BATCH_FILTERS.get(batch)
    if not fn:
        raise SystemExit(f"Unknown batch: {batch}. Choices: {', '.join(BATCH_FILTERS)}")
    return [r for r in rows if fn(r)]

_curie_done = False
_gr_done = False
_imrb_annuaire_done = False


def load_umr_rows() -> list[dict]:
    rows = []
    with UMR_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows


def row_meta(row: dict) -> dict:
    return {
        "umr": row.get("umr", "—"),
        "nom_unite": row.get("nom_unite", ""),
        "ville": row.get("ville", ""),
        "delegation_inserm": row.get("delegation_inserm", ""),
        "score_fit_lina": row.get("score_fit_lina", ""),
        "themes": row.get("themes", ""),
        "type_site": row.get("type_site", ""),
        "site_web": row.get("site_web", ""),
        "url_page_equipes_offres": row.get("url_page_equipes_offres", ""),
    }


def domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def dedupe(contacts: list[Contact]) -> list[Contact]:
    seen: dict[str, Contact] = {}
    for c in contacts:
        key = c.dedup_key()
        if key not in seen:
            seen[key] = c
            continue
        prev = seen[key]
        for field in ("email", "linkedin_url", "sujet_recherche", "role", "equipe"):
            if not getattr(prev, field) and getattr(c, field):
                setattr(prev, field, getattr(c, field))
        if not prev.linkedin_source and c.linkedin_source:
            prev.linkedin_source = c.linkedin_source
            prev.linkedin_confidence = c.linkedin_confidence
    return list(seen.values())


def scrape_row(row: dict, checkpoint: dict) -> list[Contact]:
    global _curie_done, _gr_done, _imrb_annuaire_done
    meta = row_meta(row)
    umr = meta["umr"]
    type_site = meta["type_site"]
    site = meta["site_web"]
    teams = meta["url_page_equipes_offres"] or site
    ck = f"{umr}|{site}"
    if ck in checkpoint.get("done", {}):
        return [Contact(**c) for c in checkpoint["done"][ck]]

    if type_site in SKIP_TYPES:
        if not (umr == "—" and "curie.fr" in site):
            return []

    contacts: list[Contact] = []
    dom = domain(site)

    if "curie.fr" in dom:
        if not _curie_done:
            curie_contacts = scrape_all_curie(meta, checkpoint=checkpoint)
            checkpoint.setdefault("done", {})["curie|all"] = [c.to_row() for c in curie_contacts]
            teams_total = len(list_team_urls())
            teams_done = len(checkpoint.get("curie_teams_done", []))
            _curie_done = teams_done >= teams_total
            if umr == "—":
                checkpoint["done"][ck] = [c.to_row() for c in curie_contacts]
                return curie_contacts
            contacts.extend(curie_contacts)
        elif checkpoint.get("curie_contacts"):
            contacts.extend([Contact(**row) for row in checkpoint["curie_contacts"]])
    elif "imrb.inserm.fr" in dom:
        if not _imrb_annuaire_done:
            contacts.extend(scrape_annuaire(meta))
            _imrb_annuaire_done = True
        if type_site == "site_equipe" and site:
            contacts.extend(scrape_equipe_page(site, meta))
    elif "gustaveroussy.fr" in dom:
        if not _gr_done:
            contacts.extend(scrape_teams_listing(meta))
            _gr_done = True
    elif type_site == "annuaire" and umr.isdigit():
        contacts.extend(contacts_for_umr(umr, meta))
        info = lookup_umr(umr)
        if info.get("site"):
            contacts.extend(
                scrape_generic_site(
                    info["site"],
                    {**meta, "nom_unite": info.get("title", meta["nom_unite"])},
                    teams_url=info["site"],
                    max_pages=25,
                )
            )
    elif site and type_site not in SKIP_TYPES:
        contacts.extend(scrape_generic_site(site, meta, teams_url=teams, max_pages=30))

    checkpoint.setdefault("done", {})[ck] = [c.to_row() for c in contacts]
    return contacts


def run_scrape(
    resume: bool = True,
    batch: str | None = None,
    checkpoint_path: Path = CHECKPOINT,
) -> list[Contact]:
    global _curie_done, _gr_done, _imrb_annuaire_done
    checkpoint: dict = {"done": {}}
    if resume and checkpoint_path.exists():
        checkpoint = json.loads(checkpoint_path.read_text())
        if checkpoint.get("curie_teams_done"):
            teams_total = len(list_team_urls())
            _curie_done = len(checkpoint["curie_teams_done"]) >= teams_total
        if any("imrb.inserm.fr" in k for k in checkpoint.get("done", {})):
            _imrb_annuaire_done = True
        if any("gustaveroussy.fr" in k for k in checkpoint.get("done", {})):
            _gr_done = True

    all_contacts: list[Contact] = []
    rows = filter_rows(load_umr_rows(), batch)
    for i, row in enumerate(rows):
        print(f"[{batch or 'all'} {i+1}/{len(rows)}] {row.get('umr')} {row.get('nom_unite','')[:50]}", flush=True)
        try:
            all_contacts.extend(scrape_row(row, checkpoint))
        except Exception as exc:
            checkpoint.setdefault("errors", []).append(
                {"umr": row.get("umr"), "error": str(exc)}
            )
        if (i + 1) % 3 == 0 or checkpoint.get("curie_teams_done"):
            checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2))

    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2))
    return dedupe(all_contacts)


def write_csv(path: Path, contacts: list[Contact]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        w.writeheader()
        for c in sorted(contacts, key=lambda x: (x.score_fit_lina or "0", x.umr, x.nom), reverse=True):
            w.writerow(c.to_row())
    tmp.replace(path)


def write_report(contacts: list[Contact]) -> None:
    total = len(contacts)
    with_email = sum(1 for c in contacts if c.email)
    with_linkedin = sum(1 for c in contacts if c.linkedin_url)
    by_umr: dict[str, int] = {}
    for c in contacts:
        by_umr[c.umr] = by_umr.get(c.umr, 0) + 1

    lines = [
        "# Rapport — contacts UMR Lina",
        "",
        f"- **Contacts totaux** : {total}",
        f"- **Emails publics** : {with_email} ({round(100*with_email/max(total,1),1)}%)",
        f"- **LinkedIn** : {with_linkedin} ({round(100*with_linkedin/max(total,1),1)}%)",
        "",
        "## Top UMR par volume",
        "",
    ]
    for umr, count in sorted(by_umr.items(), key=lambda x: -x[1])[:25]:
        lines.append(f"- UMR {umr} : {count} contacts")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape UMR contacts for Lina")
    parser.add_argument("--batch", choices=list(BATCH_FILTERS.keys()))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--checkpoint", type=Path)
    parser.add_argument("--skip-linkedin", action="store_true")
    parser.add_argument("--linkedin-max", type=int, default=None, help="Cap LinkedIn lookups")
    parser.add_argument("--no-resume", action="store_true")
    args = parser.parse_args()

    ckpt = args.checkpoint or (
        ROOT / "data" / "checkpoints" / f"lina-umr-scrape-{args.batch}.json"
        if args.batch
        else CHECKPOINT
    )
    out_raw = args.output or (ROOT / "data" / "batches" / f"{args.batch}.csv" if args.batch else RAW_CSV)
    out_final = OUT_CSV if not args.batch else out_raw

    contacts = run_scrape(resume=not args.no_resume, batch=args.batch, checkpoint_path=ckpt)
    write_csv(out_raw, contacts)
    print(f"Raw contacts: {len(contacts)} -> {out_raw}")

    if not args.skip_linkedin and not args.batch:
        print("LinkedIn lookup...")
        contacts = enrich_contacts_linkedin(
            contacts,
            LINKEDIN_CKPT,
            max_lookups=args.linkedin_max,
        )

    write_csv(out_final, contacts)
    if not args.batch:
        write_report(contacts)
        print(f"Final CSV: {OUT_CSV} ({len(contacts)} rows)")
        print(f"Report: {REPORT}")


if __name__ == "__main__":
    main()
