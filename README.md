# AI-Based Deepfake Voice Detection System (VocalShield)

VocalShield is an end-to-end cybersecurity application designed to detect whether an uploaded audio file contains a real human voice or an AI-generated/deepfake voice. It uses signal processing with Librosa to extract acoustic features (MFCC, Chroma, Spectral Centroid, Jitter, Shimmer, Pitch Variation) and classifies them using an ensemble of Machine Learning models (Random Forest, SVM, XGBoost).

---

## 🛡️ Key Features

1. **Secure Audio Ingestion**: Support for WAV, MP3, and FLAC files with size validation (capped at 10MB) and strict format filtering.
2. **Signal Preprocessing**: Implements automatic resampling to 16kHz, noise reduction (via spectral subtraction), silent segment trimming, and peak amplitude normalization.
3. **Advanced Acoustic Feature Extraction**:
   - **MFCCs & Chroma**: Maps spectral shape and tonal relationships.
   - **Spectral Centroid, Bandwidth, Rolloff, & ZCR**: Captures frequency center, dispersion, and vocoder noise profiles.
   - **Pitch Stability (Jitter & Shimmer)**: Measures micro-fluctuations in vocal cords to detect artificial vocoder consistency.
4. **Machine Learning Pipeline**: Trains and compares Random Forest, SVM, and XGBoost classifiers, saving the best-performing model (`model.pkl`).
5. **FastAPI Backend**: Built-in native bcrypt user registration/login, JWT authentication, and structured database scan logging (SQLite).
6. **Futuristic Cybersecurity Dashboard**: Built with React, Tailwind CSS, and Chart.js, featuring real-time scan analytics, risk profile distributions, and interactive gauges.

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │   (Vite + Tailwind)     │
                    └───────────┬─────────────┘
                                │ Upload audio / JWT Auth
                                ▼
                    ┌─────────────────────────┐
                    │     FastAPI Backend     │
                    │  (Authentication / DB)  │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌──────────────────┐                        ┌──────────────────┐
│   ML Inference   │                        │ SQLite Database  │
│  (preprocessing  │                        │ (User Registry,  │
│   & predictor)   │                        │  Scan History)   │
└──────────────────┘                        └──────────────────┘
```

---

## 📂 Project Structure

```
DeepfakeVoiceDetector/
├── backend/
│   ├── app/
│   │   ├── auth.py          # Native bcrypt, JWT, and FastAPI dependencies
│   │   ├── database.py      # SQLAlchemy configuration (SQLite/PostgreSQL)
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── models.py        # Database models (User, ScanHistory)
│   │   ├── routes.py        # Register, Login, Predict, History, Dashboard routes
│   │   └── schemas.py       # Pydantic schema schemas
│   ├── ml/
│   │   ├── preprocessing.py # Audio resampling, noise gate, trim, normalization
│   │   ├── feature_extraction.py # MFCC, Chroma, Jitter, Shimmer, Pitch features
│   │   ├── train_model.py   # Training RF, SVM, XGBoost; outputs model.pkl
│   │   ├── predict.py       # Single audio inference module
│   │   └── model.pkl        # Best saved model pipeline
│   ├── test_api.py          # Programmatic API integration test suite
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx   # Sidebar & glow backdrop page shell
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx # Stat telemetry and Chart.js graphics
│   │   │   ├── UploadPage.jsx # File dropzone & radar scanner animation
│   │   │   ├── ResultPage.jsx # Radial confidence gauge & acoustic report
│   │   │   ├── HistoryPage.jsx # Audit table with diagnostic drawer
│   │   │   ├── LoginPage.jsx # Secure terminal login
│   │   │   └── RegisterPage.jsx # Clearance registration portal
│   │   ├── services/
│   │   │   └── api.js       # Axios client with JWT headers interceptor
│   │   ├── App.jsx          # Protected React router config
│   │   ├── index.css        # Tailwind and custom keyframe animations
│   │   └── main.jsx         # React mounting wrapper
│   ├── index.html           # Main HTML index template
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json         # Node frontend dependencies
├── dataset/
│   ├── generate_synthetic_data.py # Synthesizes voice datasets programmatically
│   ├── real/                # Target folder for real human recordings
│   └── fake/                # Target folder for synthesized deepfake files
├── README.md                # System documentation
└── report.md                # Complete project development report
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have **Python 3.10+** and **Node.js 18+** installed.

### 2. Set Up the Machine Learning Pipeline & Data
First, generate the synthetic training dataset and train the ML classifiers:

```bash
# Clone or navigate to the directory
cd DeepfakeVoiceDetector

# Create and populate directories with synthetic data
python dataset/generate_synthetic_data.py

# Install backend dependencies
cd backend
python -m pip install -r requirements.txt

# Run ML model training
python ml/train_model.py
```
This evaluates the models and saves the best classifier pipeline in `backend/ml/model.pkl`.

### 3. Run FastAPI Backend
```bash
# From the backend directory:
python -m app.main
```
The server will start at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.

### 4. Run React Frontend
Open a new terminal session:
```bash
cd DeepfakeVoiceDetector/frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🛡️ Security Considerations

1. **Rate Limiting & File Size Checking**: Files are validated before reading to prevent Memory Exhaustion attacks (size limit = 10MB).
2. **Native Cryptographic Hashing**: User passkeys are processed using standard `bcrypt` (salts generated per cycle) to resist lookup tables.
3. **No Audio Persistence**: Uploaded audio segments are written to temporary system descriptors, analyzed in memory, and immediately unlinked (deleted) from storage once prediction completes.
4. **JWT Expiration**: Access tokens expire after 60 minutes, and the Axios middleware automatically clears cache and logs out sessions on HTTP 401 returns.

---

## 📑 API Endpoints

### Authentication
* `POST /api/auth/register` - Create user credentials.
* `POST /api/auth/login` - Authenticate credentials and get JWT.
* `GET /api/auth/me` - Fetch authenticated user details.

### Deepfake Detection
* `POST /api/predict` - Upload WAV/MP3/FLAC file (multipart/form-data) and get deepfake classification. (Requires JWT).

### History & Aggregates
* `GET /api/history` - Fetch user's scan logs history. (Requires JWT).
* `GET /api/dashboard` - Get aggregated scan summary statistics. (Requires JWT).
