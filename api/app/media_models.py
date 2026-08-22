from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

ALLOWED_CONTENT_TYPES = (
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "video/mp4",
)

MAX_UPLOAD_BYTES = 25 * 1024 * 1024


class UploadUrlRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    filename: str = Field(min_length=1, max_length=200)
    content_type: str = Field(alias="contentType")
    public: bool = True


class UploadUrlResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    upload_url: str = Field(alias="uploadUrl")
    storage_path: str = Field(alias="storagePath")


class MediaConfirmRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    storage_path: str = Field(alias="storagePath")
    filename: str
    content_type: str = Field(alias="contentType")
    size: int = Field(ge=0)
    public: bool = True


class MediaOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    filename: str
    content_type: str = Field(alias="contentType")
    size: int
    storage_path: str = Field(alias="storagePath")
    public: bool
    url: str | None = None
    uploaded_by_email: str | None = Field(default=None, alias="uploadedByEmail")
    created_at: datetime | None = Field(default=None, alias="createdAt")


class MediaListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[MediaOut]
    next_cursor: str | None = Field(default=None, alias="nextCursor")
