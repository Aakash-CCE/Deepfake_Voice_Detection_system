import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Import our custom modules
from preprocessing import load_and_preprocess_audio
from feature_extraction import extract_feature_vector, get_feature_names

def load_dataset(dataset_path):
    """
    Loads all WAV files in dataset_path/real and dataset_path/fake.
    Extracts features for each file.
    Returns:
    - X: feature matrix (numpy array)
    - y: labels (0 = Real, 1 = Fake)
    - feature_names: names of features extracted
    """
    real_dir = os.path.join(dataset_path, "real")
    fake_dir = os.path.join(dataset_path, "fake")
    
    if not os.path.exists(real_dir) or not os.path.exists(fake_dir):
        raise FileNotFoundError(
            f"Dataset folders not found. Please ensure '{real_dir}' and '{fake_dir}' exist and contain WAV files."
        )
        
    feature_names = get_feature_names()
    X = []
    labels = []
    
    # Process Real voices
    print("Processing real voice files...")
    real_files = [f for f in os.listdir(real_dir) if f.endswith(('.wav', '.mp3', '.flac'))]
    for filename in real_files:
        filepath = os.path.join(real_dir, filename)
        try:
            y, sr = load_and_preprocess_audio(filepath)
            features = extract_feature_vector(y, sr, feature_names)
            X.append(features)
            labels.append(0)  # 0 for Real
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            
    # Process Fake voices
    print("\nProcessing fake/deepfake voice files...")
    fake_files = [f for f in os.listdir(fake_dir) if f.endswith(('.wav', '.mp3', '.flac'))]
    for filename in fake_files:
        filepath = os.path.join(fake_dir, filename)
        try:
            y, sr = load_and_preprocess_audio(filepath)
            features = extract_feature_vector(y, sr, feature_names)
            X.append(features)
            labels.append(1)  # 1 for Fake (AI Generated)
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            
    print(f"\nSuccessfully loaded {len(X)} files (Real: {labels.count(0)}, Fake: {labels.count(1)}).")
    return np.array(X), np.array(labels), feature_names

def evaluate_model(name, model, X_test, y_test):
    """
    Computes performance metrics for a model.
    """
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    # CM layout: [[TN, FP], [FN, TP]]
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    
    return {
        "name": name,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm.tolist(),
        "tn": tn, "fp": fp, "fn": fn, "tp": tp
    }

def main():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(ml_dir))
    dataset_path = os.path.join(project_root, "dataset")
    
    print(f"Project root: {project_root}")
    print(f"Loading data from: {dataset_path}")
    
    # 1. Load data
    try:
        X, y, feature_names = load_dataset(dataset_path)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Please run generate_synthetic_data.py in the 'dataset' directory first.")
        return
        
    if len(X) == 0:
        print("Error: No audio files were successfully processed. Cannot train models.")
        return
        
    # 2. Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 3. Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Initialize and train models
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Support Vector Machine": SVC(kernel='rbf', probability=True, random_state=42),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    }
    
    results = []
    print("\nTraining and evaluating models...")
    for name, clf in models.items():
        clf.fit(X_train_scaled, y_train)
        metrics = evaluate_model(name, clf, X_test_scaled, y_test)
        results.append((name, clf, metrics))
        
    # 5. Print Comparison Table
    print("\n" + "="*80)
    print(f"{'Model Name':<25} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10}")
    print("="*80)
    for name, _, m in results:
        print(f"{name:<25} | {m['accuracy']:<10.4f} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1']:<10.4f}")
    print("="*80)
    
    for name, _, m in results:
        print(f"\nConfusion Matrix for {name}:")
        print(f"  True Real (Negative): TN={m['tn']}, FP={m['fp']}")
        print(f"  True Fake (Positive): FN={m['fn']}, TP={m['tp']}")
        
    # 6. Select and save the best model (based on F1 Score)
    best_idx = np.argmax([r[2]['f1'] for r in results])
    best_name, best_model, best_metrics = results[best_idx]
    print(f"\nSelected best model: {best_name} with F1-Score of {best_metrics['f1']:.4f}")
    
    # Save the pipeline
    output_model_path = os.path.join(ml_dir, "model.pkl")
    model_data = {
        "model_name": best_name,
        "model": best_model,
        "scaler": scaler,
        "feature_names": feature_names,
        "metrics": best_metrics
    }
    
    joblib.dump(model_data, output_model_path)
    print(f"Saved best model pipeline to: {output_model_path}")

if __name__ == "__main__":
    main()
