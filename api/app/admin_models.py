from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

LEAD_STATUSES = ("new", "contacted", "qualified", "won", "lost")
LeadStatus = Literal["new", "contacted", "qualified", "won", "lost"]

NEWSLETTER_STATUSES = ("active", "unsubscribed")
NewsletterStatus = Literal["active", "unsubscribed"]


class LeadNote(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    text: str
    author_uid: str = Field(alias="authorUid")
    author_email: str | None = Field(default=None, alias="authorEmail")
    created_at: datetime = Field(alias="createdAt")


class LeadOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    email: str
    company_size: str = Field(default="", alias="companySize")
    message: str
    status: str
    created_at: datetime | None = Field(default=None, alias="createdAt")
    notes: list[LeadNote] = Field(default_factory=list)


class LeadListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[LeadOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadNoteCreate(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class NewsletterSubscriberOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    email: str
    status: str
    subscribed_at: datetime | None = Field(default=None, alias="subscribedAt")


class NewsletterListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[NewsletterSubscriberOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")
