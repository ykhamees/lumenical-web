from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ContentStatus = Literal["draft", "published"]
CONTENT_STATUSES = ("draft", "published")

DemoKind = Literal["product", "case-study"]
DEMO_KINDS = ("product", "case-study")

SLUG_PATTERN = r"^[a-z0-9]+(-[a-z0-9]+)*$"


class SeoFields(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = None
    description: str | None = None


class PageCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str = Field(min_length=1, max_length=200, pattern=SLUG_PATTERN)
    title: str = Field(min_length=1, max_length=200)
    excerpt: str = Field(default="", max_length=500)
    body: str = ""
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0
    tags: list[str] = Field(default_factory=list)


class PageUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=200)
    excerpt: str = Field(default="", max_length=500)
    body: str = ""
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0
    tags: list[str] = Field(default_factory=list)


class PageOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str
    title: str
    excerpt: str = ""
    body: str = ""
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0
    tags: list[str] = Field(default_factory=list)
    status: str = "draft"
    created_at: datetime | None = Field(default=None, alias="createdAt")
    updated_at: datetime | None = Field(default=None, alias="updatedAt")
    published_at: datetime | None = Field(default=None, alias="publishedAt")


class PageListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[PageOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")


class DemoCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str = Field(min_length=1, max_length=200, pattern=SLUG_PATTERN)
    title: str = Field(min_length=1, max_length=200)
    kind: DemoKind = "product"
    summary: str = Field(default="", max_length=500)
    body: str = ""
    media_url: str | None = Field(default=None, alias="mediaUrl")
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0


class DemoUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str = Field(min_length=1, max_length=200, pattern=SLUG_PATTERN)
    title: str = Field(min_length=1, max_length=200)
    kind: DemoKind = "product"
    summary: str = Field(default="", max_length=500)
    body: str = ""
    media_url: str | None = Field(default=None, alias="mediaUrl")
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0


class DemoOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    slug: str
    title: str
    kind: str = "product"
    summary: str = ""
    body: str = ""
    media_url: str | None = Field(default=None, alias="mediaUrl")
    seo: SeoFields = Field(default_factory=SeoFields)
    order: int = 0
    status: str = "draft"
    created_at: datetime | None = Field(default=None, alias="createdAt")
    updated_at: datetime | None = Field(default=None, alias="updatedAt")
    published_at: datetime | None = Field(default=None, alias="publishedAt")


class DemoListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[DemoOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")
