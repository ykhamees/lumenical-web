from fastapi import FastAPI

from .routers import admin, admin_leads, admin_newsletter, health, leads, newsletter

app = FastAPI(title="Lumenical API")

app.include_router(health.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(admin_leads.router, prefix="/api")
app.include_router(admin_newsletter.router, prefix="/api")
