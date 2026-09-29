import numpy as np
import librosa

def load_and_preprocess_audio(file_path, target_sr=16000, min_duration=0.5, max_duration=30.0):
    """
    Loads an audio file and performs preprocessing:
    1. Resampling to target_sr (default 16000Hz).
    2. Validating duration.
    3. Noise reduction (spectral subtraction).
    4. Trimming silent segments.
    5. Peak amplitude normalization.
    """
    # 1. Load audio (automatically resamples if target_sr is specified)
    # librosa.load will output mono audio by default
    y, sr = librosa.load(file_path, sr=target_sr)
    
    # 2. Check duration
    duration = librosa.get_duration(y=y, sr=sr)
    if duration < min_duration:
        raise ValueError(f"Audio file is too short ({duration:.2f}s). Minimum required is {min_duration}s.")
    if duration > max_duration:
        # Trim to max duration to save processing time and memory
        y = y[:int(max_duration * sr)]
        duration = max_duration

    # 3. Basic Noise Reduction (Spectral Gating/Subtraction)
    # We estimate noise from the lowest-energy frame and subtract it from the spectrogram
    stft_y = librosa.stft(y, n_fft=1024, hop_length=256)
    magnitude, phase = librosa.magphase(stft_y)
    
    # Find the frame with the lowest average energy as the noise profile
    frame_energies = np.mean(magnitude, axis=0)
    noise_frame_idx = np.argmin(frame_energies)
    noise_profile = magnitude[:, noise_frame_idx]
    
    # Subtract noise profile (spectral subtraction)
    # We use a noise subtraction factor (e.g., 1.5) and a spectral floor (e.g., 0.02)
    subtraction_factor = 1.5
    magnitude_clean = magnitude - subtraction_factor * noise_profile[:, np.newaxis]
    magnitude_clean = np.maximum(magnitude_clean, 0.02 * magnitude)  # Spectral floor to prevent musical noise
    
    # Reconstruct clean signal
    stft_clean = magnitude_clean * phase
    y_clean = librosa.istft(stft_clean, hop_length=256)

    # 4. Trim Silence
    # Trim leading and trailing silences using a threshold of 20dB
    y_trimmed, _ = librosa.effects.trim(y_clean, top_db=20)
    if len(y_trimmed) == 0:
        # Fallback in case trimming completely silences the audio
        y_trimmed = y_clean
        
    # 5. Amplitude Normalization
    max_amp = np.max(np.abs(y_trimmed))
    if max_amp > 0:
        y_normalized = y_trimmed / max_amp
    else:
        y_normalized = y_trimmed

    return y_normalized, sr
