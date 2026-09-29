import numpy as np
import librosa

def extract_pitch_features(y, sr):
    """
    Extracts fundamental frequency (F0) and calculates vocal stability features:
    - Pitch Mean
    - Pitch Std (Variation)
    - Jitter (Local): Cycle-to-cycle frequency variations
    - Shimmer (Local): Cycle-to-cycle amplitude variations
    """
    # Extract fundamental frequency (F0) using YIN algorithm
    # fmin and fmax represent typical human pitch ranges (60 Hz to 450 Hz)
    try:
        f0 = librosa.yin(y=y, sr=sr, fmin=60, fmax=450)
        # Filter out NaN or invalid values (yin might return noise or edge artifacts)
        f0 = f0[~np.isnan(f0)]
        f0 = f0[f0 > 60]  # Ensure it is in a valid human range
    except Exception:
        f0 = np.array([])
        
    if len(f0) < 3:
        # Fallback if no valid pitch detected
        return {
            "pitch_mean": 0.0,
            "pitch_std": 0.0,
            "jitter": 0.0,
            "shimmer": 0.0
        }
        
    pitch_mean = float(np.mean(f0))
    pitch_std = float(np.std(f0))
    
    # 1. Jitter (Local) calculation: average absolute difference between consecutive periods
    # Period T = 1 / f
    periods = 1.0 / f0
    diff_periods = np.abs(np.diff(periods))
    mean_period = np.mean(periods)
    jitter = float(np.sum(diff_periods) / ((len(periods) - 1) * mean_period)) if mean_period > 0 else 0.0
    
    # 2. Shimmer (Local) calculation: average absolute difference between consecutive peak amplitudes
    # Divide the signal into segments matching the pitch periods and find the peak amplitude in each
    # For approximation, we use frames of size 512 with overlap and find the peak in each frame
    frame_length = 512
    hop_length = 256
    frames = librosa.util.frame(y, frame_length=frame_length, hop_length=hop_length)
    
    # Keep frames that match our valid F0 values in terms of timeline
    # Pitch extraction length might differ from frames length, so we align them
    num_frames = min(frames.shape[1], len(f0))
    peaks = np.max(np.abs(frames[:, :num_frames]), axis=0)
    
    # Filter out silent frames
    valid_indices = peaks > 0.01
    peaks = peaks[valid_indices]
    
    if len(peaks) < 3:
        shimmer = 0.0
    else:
        diff_peaks = np.abs(np.diff(peaks))
        mean_peaks = np.mean(peaks)
        shimmer = float(np.sum(diff_peaks) / ((len(peaks) - 1) * mean_peaks)) if mean_peaks > 0 else 0.0
        
    return {
        "pitch_mean": pitch_mean,
        "pitch_std": pitch_std,
        "jitter": jitter,
        "shimmer": shimmer
    }

def extract_features(y, sr):
    """
    Extracts all acoustic features and compiles them into a single 1D feature vector.
    Features extracted:
    - MFCC (13 coefficients: mean and std)
    - Chroma STFT (12 pitch classes: mean and std)
    - Spectral Centroid (mean and std)
    - Spectral Bandwidth (mean and std)
    - Spectral Rolloff (mean and std)
    - Zero Crossing Rate (mean and std)
    - Pitch features (mean, std, jitter, shimmer)
    """
    features = {}
    
    # 1. MFCCs (13 coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    for i in range(13):
        features[f"mfcc_{i+1}_mean"] = float(np.mean(mfccs[i]))
        features[f"mfcc_{i+1}_std"] = float(np.std(mfccs[i]))
        
    # 2. Chroma STFT (12 bins)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    for i in range(12):
        features[f"chroma_{i+1}_mean"] = float(np.mean(chroma[i]))
        features[f"chroma_{i+1}_std"] = float(np.std(chroma[i]))
        
    # 3. Spectral Centroid
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    features["spec_centroid_mean"] = float(np.mean(spec_centroid))
    features["spec_centroid_std"] = float(np.std(spec_centroid))
    
    # 4. Spectral Bandwidth
    spec_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    features["spec_bandwidth_mean"] = float(np.mean(spec_bandwidth))
    features["spec_bandwidth_std"] = float(np.std(spec_bandwidth))
    
    # 5. Spectral Rolloff
    spec_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    features["spec_rolloff_mean"] = float(np.mean(spec_rolloff))
    features["spec_rolloff_std"] = float(np.std(spec_rolloff))
    
    # 6. Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y=y)
    features["zcr_mean"] = float(np.mean(zcr))
    features["zcr_std"] = float(np.std(zcr))
    
    # 7. Voice Quality/Stability Features (Pitch, Jitter, Shimmer)
    pitch_feats = extract_pitch_features(y, sr)
    features.update(pitch_feats)
    
    return features

def get_feature_names():
    """
    Returns the exact list of feature names in the correct alphabetical order 
    or custom ordered vector format for model training consistency.
    """
    # Dummy run to get ordered keys
    dummy_signal = np.sin(2 * np.pi * 100 * np.linspace(0, 1, 16000))
    dummy_features = extract_features(dummy_signal, 16000)
    return sorted(list(dummy_features.keys()))

def extract_feature_vector(y, sr, feature_names=None):
    """
    Extracts features and returns them as a sorted 1D numpy array vector.
    """
    feats = extract_features(y, sr)
    if feature_names is None:
        feature_names = get_feature_names()
    return np.array([feats[name] for name in feature_names])
