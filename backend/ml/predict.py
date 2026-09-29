import os
import joblib
import numpy as np

# Import our custom modules
from ml.preprocessing import load_and_preprocess_audio
from ml.feature_extraction import extract_feature_vector, extract_features

class DeepfakeVoicePredictor:
    def __init__(self, model_path=None):
        if model_path is None:
            # Resolve default model.pkl path relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(current_dir, "model.pkl")
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Please train the model first."
            )
            
        print(f"Loading deepfake detector pipeline from: {model_path}")
        model_data = joblib.load(model_path)
        
        self.model = model_data["model"]
        self.scaler = model_data["scaler"]
        self.feature_names = model_data["feature_names"]
        self.model_name = model_data.get("model_name", "Unknown Classifier")
        
    def predict(self, audio_file_path):
        """
        Runs full prediction on an audio file.
        Returns a dictionary with prediction, confidence, risk_level, and explanations.
        """
        # 1. Preprocess audio
        y, sr = load_and_preprocess_audio(audio_file_path)
        
        # 2. Extract features dictionary for diagnostics
        raw_features = extract_features(y, sr)
        
        # 3. Create feature vector aligned with training feature names
        feature_vector = np.array([raw_features[name] for name in self.feature_names]).reshape(1, -1)
        
        # 4. Scale features
        scaled_vector = self.scaler.transform(feature_vector)
        
        # 5. Predict class and probabilities
        pred_class = int(self.model.predict(scaled_vector)[0])
        probabilities = self.model.predict_proba(scaled_vector)[0]
        
        confidence = float(probabilities[pred_class] * 100)
        
        # 6. Assess risk level and compile explanations
        analysis_points = []
        
        # Pull key acoustic diagnostic parameters
        pitch_std = raw_features.get("pitch_std", 0.0)
        jitter = raw_features.get("jitter", 0.0)
        shimmer = raw_features.get("shimmer", 0.0)
        spec_centroid = raw_features.get("spec_centroid_mean", 0.0)
        zcr = raw_features.get("zcr_mean", 0.0)
        
        if pred_class == 1:
            prediction_label = "AI Generated Voice"
            
            # Risk Level assignment
            if confidence >= 85:
                risk_level = "HIGH"
            else:
                risk_level = "MEDIUM"
                
            # Explain why it was classified as Fake
            if pitch_std < 10.0:
                analysis_points.append(f"Monotone/robotic pitch variation detected (std: {pitch_std:.2f} Hz).")
            if jitter < 0.001:
                analysis_points.append(f"Unnaturally perfect pitch cycle consistency (jitter: {jitter*100:.3f}%).")
            if shimmer < 0.005:
                analysis_points.append(f"Unnaturally perfect amplitude volume control (shimmer: {shimmer*100:.3f}%).")
            if spec_centroid > 2500:
                analysis_points.append(f"Elevated high-frequency neural vocoder artifacts detected (centroid: {spec_centroid:.0f} Hz).")
            if zcr > 0.15:
                analysis_points.append(f"High Zero Crossing Rate (noise/buzzing floor) detected: {zcr:.4f}.")
                
            if not analysis_points:
                analysis_points.append("Synthetic spectral resonance and phase patterns mismatching natural vocal tracts.")
        else:
            prediction_label = "Real Human Voice"
            
            if confidence >= 80:
                risk_level = "LOW"
            else:
                risk_level = "MEDIUM"
                
            # Highlight natural voice properties
            if pitch_std >= 10.0:
                analysis_points.append(f"Natural intonation contour and speaking voice inflection (std: {pitch_std:.2f} Hz).")
            if jitter >= 0.002:
                analysis_points.append(f"Natural biological micro-fluctuations in pitch period (jitter: {jitter*100:.3f}%).")
            if shimmer >= 0.01:
                analysis_points.append(f"Natural human amplitude and speaking breath modulation (shimmer: {shimmer*100:.3f}%).")
            if spec_centroid <= 2500:
                analysis_points.append(f"Spectral footprint matches normal biological vocal cord resonation (centroid: {spec_centroid:.0f} Hz).")
                
            if not analysis_points:
                analysis_points.append("Organic frequency structure consistent with human throat anatomy.")
                
        # Format diagnostics metrics
        diagnostics = {
            "pitch_mean": float(raw_features.get("pitch_mean", 0.0)),
            "pitch_std": float(pitch_std),
            "jitter": float(jitter),
            "shimmer": float(shimmer),
            "spec_centroid": float(spec_centroid),
            "spec_bandwidth": float(raw_features.get("spec_bandwidth_mean", 0.0)),
            "spec_rolloff": float(raw_features.get("spec_rolloff_mean", 0.0)),
            "zcr": float(zcr)
        }
        
        return {
            "prediction": prediction_label,
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "analysis": analysis_points,
            "metrics": diagnostics
        }

if __name__ == "__main__":
    # Test block
    import sys
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        try:
            predictor = DeepfakeVoicePredictor()
            result = predictor.predict(test_file)
            print("Prediction Results:")
            import json
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error testing predictor: {e}")
    else:
        print("Usage: python predict.py <path_to_audio_file>")
