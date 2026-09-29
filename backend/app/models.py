import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationship to history records
    scans = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")

class ScanHistory(Base):
    __tablename__ = "scan_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    prediction = Column(String, nullable=False)  # "Real Human Voice" or "AI Generated Voice"
    confidence = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # "LOW", "MEDIUM", "HIGH"
    
    # Acoustic metrics stored for dashboard visualization
    pitch_mean = Column(Float, default=0.0)
    pitch_std = Column(Float, default=0.0)
    jitter = Column(Float, default=0.0)
    shimmer = Column(Float, default=0.0)
    spec_centroid = Column(Float, default=0.0)
    spec_bandwidth = Column(Float, default=0.0)
    spec_rolloff = Column(Float, default=0.0)
    zcr = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="scans")
