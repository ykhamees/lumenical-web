from fastapi import FastAPI

from .routers import (
    admin,
    admin_demos,
    admin_leads,
    admin_newsletter,
    admin_pages,
    health,
    leads,
    newsletter,
)

app = FastAPI(title="Lumenical API")

app.include_router(health.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(admin_leads.router, prefix="/api")
app.include_router(admin_newsletter.router, prefix="/api")
app.include_router(admin_pages.router, prefix="/api")
app.include_router(admin_demos.router, prefix="/api")
