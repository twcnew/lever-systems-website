from __future__ import annotations

import re
import unicodedata
from typing import Iterable, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup, Tag

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
LINKEDIN_RE = re.compile(
    r"https?://(?:[a-z]{2,3}\.)?linkedin\.com/(?:in|pub)/[A-Za-z0-9\-_%]+/?",
    re.I,
)

PI_ROLES = re.compile(
    r"directeur|directrice|chef d.?équipe|chef d.?equipe|responsable|head of|pi\b|"
    r"unité de recherche|unit director|group leader",
    re.I,
)
RESEARCHER_ROLES = re.compile(
    r"chercheur|chercheuse|researcher|cr\d|dr\d|inserm|cnrs|mcu|mcf|pu-ph|"
    r"professeur|professor|enseignant|post.?doc|doctorant|ingénieur|engineer|"
    r"chargé de recherche|chargée de recherche|clinicien|clinicienne|praticien",
    re.I,
)
SKIP_ROLES = re.compile(
    r"^stagiaire$|^alternant|^secrétaire|^assistant administratif|^technicien de laboratoire$",
    re.I,
)


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def slugify_name(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def split_name(full_name: str) -> tuple[str, str]:
    full_name = normalize_space(full_name)
    if not full_name:
        return "", ""
    parts = full_name.split()
    if len(parts) == 1:
        return "", parts[0]
    return " ".join(parts[:-1]), parts[-1]


def infer_role_tier(role: str) -> str:
    role = role or ""
    if PI_ROLES.search(role):
        return "A"
    if RESEARCHER_ROLES.search(role):
        return "B"
    return "C"


def should_include_role(role: str) -> bool:
    role = normalize_space(role)
    if not role:
        return True
    if SKIP_ROLES.search(role):
        return False
    return True


def extract_emails(soup: BeautifulSoup | str) -> list[str]:
    if isinstance(soup, str):
        soup = BeautifulSoup(soup, "lxml")
    emails: list[str] = []
    for a in soup.select('a[href^="mailto:"]'):
        href = a.get("href", "")
        email = href.split("mailto:")[-1].split("?")[0].strip()
        if email and "@" in email:
            emails.append(email.lower())
    for match in EMAIL_RE.findall(soup.get_text(" ", strip=True)):
        if not match.endswith((".png", ".jpg", ".gif")):
            emails.append(match.lower())
    return list(dict.fromkeys(emails))


def extract_linkedin_urls(soup: BeautifulSoup | str) -> list[str]:
    if isinstance(soup, str):
        text = soup
    else:
        text = str(soup)
    urls = []
    for match in LINKEDIN_RE.findall(text):
        url = match.rstrip("/")
        if "/company/" not in url.lower():
            urls.append(url)
    return list(dict.fromkeys(urls))


def same_domain(base_url: str, link: str) -> bool:
    b = urlparse(base_url).netloc
    l = urlparse(urljoin(base_url, link)).netloc
    return b == l


def collect_links(soup: BeautifulSoup, base_url: str, patterns: Iterable[str]) -> list[str]:
    found: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(base_url, href)
        for pattern in patterns:
            if re.search(pattern, href, re.I):
                found.append(full)
                break
    return list(dict.fromkeys(found))


def text_after_heading(soup: BeautifulSoup, headings: Iterable[str]) -> str:
    wanted = {h.lower() for h in headings}
    for tag in soup.find_all(["h1", "h2", "h3", "h4", "strong", "p", "div"]):
        label = normalize_space(tag.get_text())
        if label.lower() in wanted:
            chunks = []
            for sib in tag.find_next_siblings(["p", "div", "ul"], limit=4):
                t = normalize_space(sib.get_text(" ", strip=True))
                if t and len(t) > 20:
                    chunks.append(t)
            if chunks:
                return " ".join(chunks)[:500]
    return ""


def table_rows(soup: BeautifulSoup) -> list[list[str]]:
    rows: list[list[str]] = []
    for table in soup.find_all("table"):
        for tr in table.find_all("tr"):
            cells = [normalize_space(td.get_text(" ", strip=True)) for td in tr.find_all(["td", "th"])]
            if cells and any(cells):
                rows.append(cells)
    return rows


def merge_topics(*parts: Optional[str]) -> str:
    items: list[str] = []
    for part in parts:
        if not part:
            continue
        for chunk in re.split(r"[;|/\n]+", part):
            chunk = normalize_space(chunk)
            if chunk and chunk.lower() not in {x.lower() for x in items}:
                items.append(chunk)
    return ";".join(items[:6])
