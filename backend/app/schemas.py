from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional
from datetime import datetime

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MetricDiagnostics(BaseModel):
    pitch_mean: float
    pitch_std: float
    jitter: float
    shimmer: float
    spec_centroid: float
    spec_bandwidth: float
    spec_rolloff: float
    zcr: float

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    analysis: List[str]
    metrics: MetricDiagnostics

class ScanHistoryResponse(BaseModel):
    id: int
    filename: str
    prediction: str
    confidence: float
    risk_level: str
    created_at: datetime
    pitch_mean: float
    pitch_std: float
    jitter: float
    shimmer: float
    spec_centroid: float
    spec_bandwidth: float
    spec_rolloff: float
    zcr: float
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_scans: int
    fake_detected: int
    real_detected: int
    avg_confidence: float
    risk_distribution: Dict[str, int]
    recent_activity: List[ScanHistoryResponse]
