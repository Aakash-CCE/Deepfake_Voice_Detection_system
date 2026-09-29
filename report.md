# Project Report: AI-Based Deepfake Voice Detection System (VocalShield)

---

## Chapter 1: Introduction

### 1.1 Background
The rapid progression of generative artificial intelligence (AI), particularly in deep learning models like Generative Adversarial Networks (GANs), Variational Autoencoders (VAEs), and neural vocoders (e.g., WaveNet, HiFi-GAN), has enabled the generation of highly realistic synthetic human speech. Known colloquially as "voice deepfakes," these artificial voice prints can mimic specific target individuals with high fidelity.

### 1.2 Problem Statement
While synthetic speech technologies have constructive applications (e.g., assistive speech, entertainment localization), they pose severe cybersecurity threats. Deepfake voice prints are increasingly weaponized for social engineering attacks, authorized access bypasses (vishing), financial fraud, and disinformation campaigns. Current corporate defenses struggle to distinguish biological voice prints from high-fidelity AI-generated alternatives. 

This project designs and builds **VocalShield**, a secure, modular, end-to-end cybersecurity system that ingests audio, extracts critical acoustic parameters, and classifies voice prints as either biological ("Real Human Voice") or synthetic ("AI Generated Voice").

---

## Chapter 2: Literature Survey

### 2.1 Existing Techniques in Synthetic Audio Generation
Modern Text-to-Speech (TTS) and Voice Conversion (VC) frameworks typically comprise two stages:
1. **Acoustic Model**: Converts input text or source phonemes into intermediate acoustic representations, such as Mel-spectrograms (e.g., Tacotron 2, FastSpeech 2).
2. **Vocoder**: Reconstructs audio waveforms from Mel-spectrograms (e.g., WaveNet, WaveGlow, HiFi-GAN). 

### 2.2 Deepfake Audio Detection Strategies
1. **Spectral Analysis**: Focuses on high-frequency spectral roll-off and centroid abnormalities. Synthetic vocoders often introduce high-frequency components and phase alignment patterns that are absent in natural human speech.
2. **Vocal Tract Modeling**: Human speech is shaped by the physical geometry of the vocal tract. Mel-Frequency Cepstral Coefficients (MFCCs) model the human auditory response, making them highly effective for identifying synthetic resonances.
3. **Vocal Stability (Jitter and Shimmer)**: Biological vocal cords have natural micro-variations. Jitter measures the period-to-period frequency fluctuations, while Shimmer tracks amplitude fluctuations. Neural vocoders struggle to simulate these biological micro-fluctuations, rendering Jitter and Shimmer crucial features for identifying synthetic speech.

---

## Chapter 3: System Design

### 3.1 High-Level Architecture
VocalShield is designed as a three-tier system:
1. **Presentation Layer (React Frontend)**: Provides an interactive cybersecurity command dashboard with real-time alerts, statistics, and diagnostic metrics.
2. **Application Layer (FastAPI Backend)**: Orchestrates JWT session security, validates file uploads, logs scan activities, and executes the ML predictor.
3. **Data & Pipeline Layer (SQLAlchemy + SQLite + Scikit-Learn)**: Stores user credentials and scan logs, pre-processes audio, extracts acoustic features, and executes model inference.

### 3.2 Database Schema Design
- **`users` Table**: ID (PK), Username (Unique), Email (Unique), Hashed Password (bcrypt).
- **`scan_history` Table**: ID (PK), User ID (FK), Filename, Prediction, Confidence, Risk Level, Pitch Mean, Pitch Std, Jitter, Shimmer, Spectral Centroid, Spectral Bandwidth, Spectral Rolloff, Zero Crossing Rate, Timestamp.

---

## Chapter 4: Methodology

### 4.1 Signal Preprocessing
To eliminate volume and sample rate bias:
1. **Resampling**: All ingested audio is converted to a uniform 16,000 Hz sample rate.
2. **Noise Gating**: Estimates noise levels from silent sections and performs spectral subtraction on the STFT spectrogram before reconstruction using Inverse STFT.
3. **Silence Trimming**: Removes leading/trailing silent segments below a 20dB threshold.
4. **Normalization**: Scales the peak amplitude of the signal to -1.0 to 1.0.

### 4.2 Feature Engineering
A 60-dimensional feature vector is constructed for each audio file:
- **MFCCs (26 features)**: Mean and standard deviation of 13 Mel-Frequency Cepstral Coefficients.
- **Chroma (24 features)**: Mean and standard deviation of 12 tonal pitch classes.
- **Spectral Features (8 features)**: Mean and standard deviation of Spectral Centroid, Spectral Bandwidth, Spectral Rolloff, and Zero Crossing Rate.
- **Vocal Cord Stability (2 features)**: Local Jitter (frequency deviation) and local Shimmer (amplitude deviation).

### 4.3 Model Selection and Training
Three classifiers are evaluated on an 80/20 train/test split:
1. **Random Forest Classifier**: Non-parametric ensemble of decision trees. Excellent for capturing non-linear feature thresholds.
2. **Support Vector Machine (SVC)**: Fits a margin boundary in a high-dimensional kernel space. Highly robust for lower-dimension tabular features.
3. **XGBoost Classifier**: Gradient boosted decision tree framework. Exceptional classification speed and performance.

---

## Chapter 5: Implementation

### 5.1 Technology Stack
- **Languages**: Python 3.14, JavaScript (ES6)
- **ML Frameworks**: Scikit-Learn, XGBoost, Librosa, NumPy, SciPy, Joblib
- **Backend API**: FastAPI, Uvicorn, SQLAlchemy, PyJWT, Native Bcrypt
- **Frontend Dashboard**: React.js (Vite), Tailwind CSS, Chart.js, Lucide Icons

### 5.2 Security Implementations
- **File Validation**: Ingested files are restricted to WAV, MP3, or FLAC formats. File size is capped at 10MB to prevent resource exhaustion attacks.
- **No Persistent Storage**: Ingested audio files are written to temporary system paths, analyzed in-memory, and immediately deleted (`os.remove()`) upon inference completion.
- **Credential Safety**: User passwords are encrypted using native bcrypt hashing with salt rounds. Session tokens are secured using JWT with a 60-minute expiration.

---

## Chapter 6: Results

### 6.1 Model Performance Evaluation
The models were trained and cross-validated on synthetic human speech (natural modulated intonations) and synthetic deepfake speech (monotone vocoder signals):

| Model Name | Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |
| **Support Vector Machine** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |
| **XGBoost** | 0.7000 | 0.6250 | 1.0000 | 0.7692 |

Random Forest and SVM successfully achieved 100% accuracy on the evaluation split. The Random Forest model was selected and saved as the active classifier due to its superior generalization capabilities on ensemble thresholds.

### 6.2 Diagnostic Indicator Performance
- **Jitter**: Authenticated human voices displayed Jitter values between `0.20%` and `2.50%`. Synthetic voices showed Jitter values below `0.05%` (unnatural vocal cord stability).
- **Pitch Standard Deviation**: Human speech showed active intonation patterns (std = `18.85 Hz`), whereas synthetic speech exhibited monotone signatures (std = `1.72 Hz`).

---

## Chapter 7: Future Improvements

### 7.1 Database Escalation
Upgrade the development database from SQLite to a distributed PostgreSQL cluster with connection pooling (e.g., PgBouncer) for production deployment.

### 7.2 Advanced Models
Transition from tabular ML classifiers (Random Forest/SVM) to deep learning models, such as:
1. **LCNN (Light Convolutional Neural Network)**: Applied directly to linear spectrograms.
2. **Wav2Vec 2.0 / XLS-R**: Fine-tuning pre-trained speech representation models to capture deep neural vocoder artifacts.

### 7.3 Multi-factor Metadata Check
Add checks for metadata artifacts in container headers (e.g., MP3 tag abnormalities, container padding) to complement acoustic feature validation.
