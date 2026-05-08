"""
Общие dataclass'ы — единый формат, в котором парсеры отдают данные.
Backend'у плевать с какого маркетплейса пришло — главное чтобы был такой shape.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ProductData:
    source: str               # "uzum" | "asaxiy" | ...
    external_id: str
    name: str
    url: str
    price: Optional[float] = None
    rating_avg: Optional[float] = None
    reviews_count: int = 0
    category: Optional[str] = None


@dataclass
class ReviewData:
    external_id: str
    text: str
    author: str = ""
    rating: Optional[int] = None
    posted_at: Optional[datetime] = None
    language: str = "unk"
    raw: dict = field(default_factory=dict)
