
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routers import (
    auth,
    profile,
    conditions,
    vitals,
    lifestyle,
    risk,
    ml_research,
    emergencies,
    ambulance_tracking,
)

app = FastAPI(
    title="SumanCare API",
    description="AI-powered personal health monitoring and emergency response platform",
    version="1.0.0",
)

# CORS configuration for Vercel frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://suman-care.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing database tables ko automatically create/alter nahi karna.
# Base.metadata.create_all(bind=engine)

# Register API routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(conditions.router)
app.include_router(vitals.router)
app.include_router(lifestyle.router)
app.include_router(risk.router)
app.include_router(ml_research.router)
app.include_router(emergencies.router)
app.include_router(ambulance_tracking.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SumanCare API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
