import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User, ScanHistory
from app.auth import get_current_user, get_password_hash, verify_password, create_access_token
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    PredictionResponse, ScanHistoryResponse, DashboardStats
)
from ml.predict import DeepfakeVoicePredictor

router = APIRouter(prefix="/api")

# Lazy initialize the predictor, loaded once when needed
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        try:
            _predictor = DeepfakeVoicePredictor()
        except Exception as e:
            # Fallback warning if model.pkl hasn't been generated yet
            print(f"Warning: Predictor could not be loaded: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Machine learning model is not loaded. Ensure it is trained. Error: {e}"
            )
    return _predictor

# --- AUTH ROUTES ---

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if username exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
        
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
        
    # Create new user
    hashed_pwd = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/auth/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == login_data.username_or_email) | 
        (User.email == login_data.username_or_email)
    ).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username/email or password"
        )
        
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

# Standard OAuth2 form login endpoint (so Swagger UI /docs works out of the box)
@router.post("/auth/login-form", response_model=TokenResponse, include_in_schema=False)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password"
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# --- PREDICTION ROUTES ---

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/predict", response_model=PredictionResponse)
async def predict_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    predictor: DeepfakeVoicePredictor = Depends(get_predictor)
):
    # 1. Validate file extension
    filename = file.filename
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # 2. Read file contents and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum allowed size is {MAX_FILE_SIZE / (1024*1024)} MB."
        )
        
    # 3. Save contents to temporary file
    # (NamedTemporaryFile is clean and works across operating systems)
    temp_fd, temp_path = tempfile.mkstemp(suffix=ext)
    try:
        with os.fdopen(temp_fd, 'wb') as tmp:
            tmp.write(contents)
            
        # Run prediction
        result = predictor.predict(temp_path)
        
        # 4. Save to Database Scan History
        metrics = result["metrics"]
        db_scan = ScanHistory(
            user_id=current_user.id,
            filename=filename,
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            pitch_mean=metrics["pitch_mean"],
            pitch_std=metrics["pitch_std"],
            jitter=metrics["jitter"],
            shimmer=metrics["shimmer"],
            spec_centroid=metrics["spec_centroid"],
            spec_bandwidth=metrics["spec_bandwidth"],
            spec_rolloff=metrics["spec_rolloff"],
            zcr=metrics["zcr"]
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        
    except ValueError as val_err:
        # Preprocessing error (e.g. audio too short)
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        print(f"Exception during prediction execution: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction processing failed: {str(e)}")
    finally:
        # Delete temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return result


# --- HISTORY & DASHBOARD ROUTES ---

@router.get("/history", response_model=List[ScanHistoryResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = db.query(ScanHistory).filter(
        ScanHistory.user_id == current_user.id
    ).order_by(ScanHistory.created_at.desc()).all()
    return scans

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans_query = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id)
    
    total_scans = scans_query.count()
    fake_detected = scans_query.filter(ScanHistory.prediction == "AI Generated Voice").count()
    real_detected = scans_query.filter(ScanHistory.prediction == "Real Human Voice").count()
    
    # Calculate average confidence
    all_scans = scans_query.all()
    if total_scans > 0:
        avg_confidence = sum([s.confidence for s in all_scans]) / total_scans
    else:
        avg_confidence = 0.0
        
    # Risk distribution count
    risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for s in all_scans:
        risk_distribution[s.risk_level] = risk_distribution.get(s.risk_level, 0) + 1
        
    # Recent activity: latest 10 scans
    recent_activity = scans_query.order_by(ScanHistory.created_at.desc()).limit(10).all()
    
    return {
        "total_scans": total_scans,
        "fake_detected": fake_detected,
        "real_detected": real_detected,
        "avg_confidence": round(avg_confidence, 1),
        "risk_distribution": risk_distribution,
        "recent_activity": recent_activity
    }
