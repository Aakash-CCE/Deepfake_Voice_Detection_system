import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import router

# Automatically create database tables at startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Deepfake Voice Detector API",
    description="Backend API for detecting synthetic and AI-generated voices.",
    version="1.0.0"
)

# Enable CORS for local React development (typically runs on http://localhost:5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints under /api
app.include_router(router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Deepfake Voice Detection API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
