from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, deals, contacts, broker_kit, content, appraisal


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"\n  818 Capital API starting on port {settings.BACKEND_PORT}")
    print(f"  Frontend URL: {settings.FRONTEND_URL}\n")
    yield
    print("\n  818 Capital API shutting down\n")


app = FastAPI(
    title="818 Capital API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(deals.router, prefix="/api/deals", tags=["deals"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])
app.include_router(broker_kit.router, prefix="/api/broker-kit", tags=["broker-kit"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(appraisal.router, prefix="/api/appraisal", tags=["appraisal"])


@app.get("/")
async def root():
    return {"name": "818 Capital API", "version": "0.1.0", "docs": "/docs"}
