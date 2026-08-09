from __future__ import annotations

import time
from typing import Optional

import requests
from bs4 import BeautifulSoup

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    }
)

_last_request = 0.0
DELAY_SEC = 1.2


def fetch(url: str, delay: float = DELAY_SEC, timeout: int = 25) -> Optional[str]:
    global _last_request
    elapsed = time.time() - _last_request
    if elapsed < delay:
        time.sleep(delay - elapsed)
    try:
        resp = SESSION.get(url, timeout=timeout, allow_redirects=True)
        _last_request = time.time()
        if resp.status_code >= 400:
            return None
        return resp.text
    except requests.RequestException:
        _last_request = time.time()
        return None


def fetch_soup(url: str, delay: float = DELAY_SEC) -> Optional[BeautifulSoup]:
    html = fetch(url, delay=delay)
    if not html:
        return None
    return BeautifulSoup(html, "lxml")
