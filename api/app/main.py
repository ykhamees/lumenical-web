from fastapi import FastAPI

from .routers import health, leads, newsletter

app = FastAPI(title="Lumenical API")

app.include_router(health.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
