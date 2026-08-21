from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

COMPANY_SIZES = {"1-4", "5-20", "21-50", "51-100", "100+", ""}


class LeadRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    company_size: str = Field(default="", alias="companySize", max_length=20)
    message: str = Field(min_length=1, max_length=5000)
    turnstile_token: str = Field(default="", alias="turnstileToken")
    # Honeypot — real users never see or fill this field. Any non-empty
    # value is treated as a bot signal, handled in the route (not here),
    # so the response looks identical to a real success.
    website: str = ""

    @field_validator("company_size")
    @classmethod
    def validate_company_size(cls, v: str) -> str:
        if v not in COMPANY_SIZES:
            raise ValueError("invalid company size")
        return v


class LeadResponse(BaseModel):
    ok: bool = True


class NewsletterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    turnstile_token: str = Field(default="", alias="turnstileToken")
    website: str = ""


class NewsletterResponse(BaseModel):
    ok: bool = True
