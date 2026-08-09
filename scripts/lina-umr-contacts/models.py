from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Optional


CSV_FIELDS = [
    "umr",
    "nom_unite",
    "prenom",
    "nom",
    "role",
    "role_tier",
    "equipe",
    "sujet_recherche",
    "email",
    "linkedin_url",
    "linkedin_source",
    "linkedin_confidence",
    "ville",
    "delegation_inserm",
    "score_fit_lina",
    "source_url",
]


@dataclass
class Contact:
    umr: str = ""
    nom_unite: str = ""
    prenom: str = ""
    nom: str = ""
    role: str = ""
    role_tier: str = ""
    equipe: str = ""
    sujet_recherche: str = ""
    email: str = ""
    linkedin_url: str = ""
    linkedin_source: str = ""
    linkedin_confidence: str = ""
    ville: str = ""
    delegation_inserm: str = ""
    score_fit_lina: str = ""
    source_url: str = ""
    _key: str = field(default="", repr=False)

    def to_row(self) -> dict:
        return {k: getattr(self, k, "") for k in CSV_FIELDS}

    def dedup_key(self) -> str:
        if self._key:
            return self._key
        return "|".join(
            [
                self.umr.strip().lower(),
                self.prenom.strip().lower(),
                self.nom.strip().lower(),
                self.equipe.strip().lower(),
            ]
        )
