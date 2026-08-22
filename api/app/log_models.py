from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AuditLogEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    action: str
    target_collection: str = Field(alias="targetCollection")
    target_id: str = Field(alias="targetId")
    actor_uid: str = Field(alias="actorUid")
    actor_email: str | None = Field(default=None, alias="actorEmail")
    before: dict[str, Any] = Field(default_factory=dict)
    after: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = Field(default=None, alias="createdAt")


class AuditLogListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[AuditLogEntry]
    next_cursor: str | None = Field(default=None, alias="nextCursor")


class OutboundEmailEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    to: str
    subject: str
    provider: str
    status: str
    error: str | None = None
    related_lead_id: str | None = Field(default=None, alias="relatedLeadId")
    sent_at: datetime | None = Field(default=None, alias="sentAt")


class OutboundEmailListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[OutboundEmailEntry]
    next_cursor: str | None = Field(default=None, alias="nextCursor")
