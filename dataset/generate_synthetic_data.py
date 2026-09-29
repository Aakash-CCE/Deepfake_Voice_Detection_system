import os
import numpy as np
import scipy.io.wavfile as wavfile

def generate_voice_wave(duration=3.0, sample_rate=16000, is_fake=False, seed=42):
    """
    Generates a synthetic voice-like signal.
    - Real voice: modulated pitch (intonation), harmonic overtones, natural jitter/shimmer.
    - Fake voice: constant pitch, artificial harmonics, phase noise, or robotic spectral artifacts.
    """
    np.random.seed(seed)
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    
    # Base fundamental frequency (F0)
    # Real voices have dynamic pitch (intonation contours)
    # Fake voices often have flatter, more robotic pitch
    if not is_fake:
        # Intonation contour (speech-like modulation)
        # Slow modulation (1.5 Hz and 0.5 Hz) to simulate speaking inflection
        f0_base = 150.0  # Hz (typical male/female average)
        f0_mod = 25.0 * np.sin(2 * np.pi * 1.2 * t) + 10.0 * np.sin(2 * np.pi * 0.4 * t)
        f0 = f0_base + f0_mod
        
        # Natural Jitter (frequency deviation, cycle-to-cycle)
        # Add high-frequency micro-variation (e.g., 0.5% jitter)
        jitter = 0.005 * np.random.randn(len(t))
        f0 = f0 * (1.0 + jitter)
    else:
        # Flat, monotone pitch with very little variation (typical of basic text-to-speech)
        f0_base = 130.0
        # Almost no dynamic inflection, maybe a slight linear drift
        f0 = f0_base * np.ones_like(t) + 2.0 * t
        
        # Artificial high-frequency jitter or zero jitter (unnatural consistency)
        # In this case, we make it perfectly flat (extremely low jitter) to show distinction
        jitter = 0.0001 * np.random.randn(len(t))
        f0 = f0 * (1.0 + jitter)
        
    # Integrate frequency to get phase
    phase = 2 * np.pi * np.cumsum(f0) / sample_rate
    
    # Generate fundamental wave and harmonics (human voice has strong harmonics)
    # Real voice: standard decaying harmonic series
    # Fake voice: uneven or overly booster harmonics, plus high frequency vocoder noise
    signal = np.sin(phase)  # F0
    
    harmonics = [2, 3, 4, 5]
    for h in harmonics:
        # Decaying amplitude for higher harmonics
        amp = 1.0 / h
        if not is_fake:
            # Natural phase variations in harmonics
            signal += amp * np.sin(h * phase + np.random.uniform(-0.2, 0.2))
        else:
            # Overly rigid harmonic phase relationships
            signal += amp * np.sin(h * phase)
            
    # Natural Shimmer (amplitude variation, cycle-to-cycle)
    if not is_fake:
        # Speech envelope + micro shimmer (1% variation)
        shimmer = 1.0 + 0.03 * np.sin(2 * np.pi * 8 * t) + 0.01 * np.random.randn(len(t))
        # Add a speaking envelope (breathing and word segments)
        envelope = np.sin(np.pi * t / duration) ** 0.5
        signal = signal * shimmer * envelope
    else:
        # Flat amplitude or highly artificial envelopes
        shimmer = 1.0 + 0.001 * np.random.randn(len(t))
        envelope = np.ones_like(t)
        # Fade in and out slightly at the boundaries to prevent clicks
        fade = np.minimum(1.0, np.minimum(t / 0.1, (duration - t) / 0.1))
        signal = signal * shimmer * envelope * fade
        
    # Vocoder / Phase Artifacts for Fake Voice
    if is_fake:
        # Add high-frequency robotic noise (e.g. vocoder buzzing)
        buzz = 0.05 * np.random.randn(len(t)) * np.sin(2 * np.pi * 6000 * t)
        signal += buzz
        # Add some white noise floor typical of synthesized speech processing
        signal += 0.01 * np.random.randn(len(t))
    else:
        # Natural ambient room noise (very quiet)
        signal += 0.002 * np.random.randn(len(t))
        
    # Normalize to -1.0 to 1.0
    signal = signal / np.max(np.abs(signal))
    
    # Convert to 16-bit PCM integer data
    audio_data = (signal * 32767).astype(np.int16)
    return audio_data

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    real_dir = os.path.join(base_dir, "real")
    fake_dir = os.path.join(base_dir, "fake")
    
    os.makedirs(real_dir, exist_ok=True)
    os.makedirs(fake_dir, exist_ok=True)
    
    print("Generating synthetic dataset...")
    
    # Generate 25 real voice files
    for i in range(25):
        data = generate_voice_wave(is_fake=False, seed=i)
        filepath = os.path.join(real_dir, f"real_voice_{i+1:03d}.wav")
        wavfile.write(filepath, 16000, data)
        
    # Generate 25 fake voice files
    for i in range(25):
        data = generate_voice_wave(is_fake=True, seed=100 + i)
        filepath = os.path.join(fake_dir, f"fake_voice_{i+1:03d}.wav")
        wavfile.write(filepath, 16000, data)
        
    print(f"Dataset generated successfully under {base_dir}!")
    print(f"Generated {25} real audio files and {25} fake audio files.")

if __name__ == "__main__":
    main()
