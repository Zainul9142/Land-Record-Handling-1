import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.endpoints import router
from app.db.database import init_db
from app.engine.data_generator import seed_synthetic_dataset

app = FastAPI(
    title="BhoomiShield API — Jharkhand Land Identity & Risk Intelligence",
    description="Unified land identity, record consistency engine, risk scoring, grounded AI assistant, and QR report verification for Jharkhand.",
    version="1.0"
)

# Enable GZIP compression for high responsiveness
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    # Auto-seed synthetic 10,000 parcels dataset on startup if needed
    seed_synthetic_dataset(10000)

app.include_router(router, prefix="/api/v1")
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
