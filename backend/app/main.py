from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, storage, billing, admin

# Import models so tables get created
from app.models import user, storage as storage_model, billing as billing_model

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StoraX API",
    description="Production-grade Multi-tenant Object Storage & Billing Engine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://storax-5vt3.vercel.app",
    "https://storax.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(storage.router, prefix="/api/storage", tags=["Storage"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def root():
    return {
        "message": "StoraX API - Production-grade Multi-tenant Object Storage & Billing Engine",
        "version": "1.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StoraX API",
        "version": "1.0.0"
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)