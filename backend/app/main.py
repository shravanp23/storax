from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, storage, billing, admin
from app.models import user, storage as storage_model, billing as billing_model

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StoraX API",
    description="Production-grade Multi-tenant Object Storage & Billing Engine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

origins = [
    "https://storax-5vt3.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(storage.router, prefix="/api/storage", tags=["Storage"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StoraX API",
        "version": "1.0.0"
    }

