import os
import sys
import time
import requests
import random
import string

API_URL = "http://127.0.0.1:8000"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_tests():
    print("=== STARTING BACKEND INTEGRATION TESTS ===")
    
    # Generate unique credentials
    username = f"testuser_{get_random_string()}"
    email = f"{username}@test.com"
    password = "testpassword123"
    
    # 1. Register User
    print(f"\n1. Registering user '{username}'...")
    reg_response = requests.post(
        f"{API_URL}/api/auth/register",
        json={"username": username, "email": email, "password": password}
    )
    if reg_response.status_code == 201:
        print("   [SUCCESS] User registered.")
    else:
        print(f"   [FAILED] Registration failed: {reg_response.text}")
        sys.exit(1)
        
    # 2. Login User
    print(f"\n2. Authenticating user '{username}'...")
    login_response = requests.post(
        f"{API_URL}/api/auth/login",
        json={"username_or_email": username, "password": password}
    )
    if login_response.status_code == 200:
        data = login_response.json()
        token = data["access_token"]
        print("   [SUCCESS] Logged in. Token received.")
    else:
        print(f"   [FAILED] Login failed: {login_response.text}")
        sys.exit(1)
        
    # Prepare auth header
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Test Audio Upload & Prediction
    print("\n3. Testing deepfake voice prediction upload...")
    
    # Resolve paths for a synthetic audio file
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    real_audio_path = os.path.join(project_root, "dataset", "real", "real_voice_001.wav")
    fake_audio_path = os.path.join(project_root, "dataset", "fake", "fake_voice_001.wav")
    
    if not os.path.exists(real_audio_path) or not os.path.exists(fake_audio_path):
        print(f"   [ERROR] Audio files not found. Ensure synthetic dataset is generated.")
        sys.exit(1)
        
    # Test Real voice prediction
    print(f"   Uploading REAL voice file: {os.path.basename(real_audio_path)}")
    with open(real_audio_path, 'rb') as f:
        files = {'file': (os.path.basename(real_audio_path), f, 'audio/wav')}
        pred_res = requests.post(f"{API_URL}/api/predict", headers=headers, files=files)
        
    if pred_res.status_code == 200:
        res_data = pred_res.json()
        print("   [SUCCESS] Received prediction:")
        print(f"     Verdict: {res_data['prediction']}")
        print(f"     Confidence: {res_data['confidence']}%")
        print(f"     Risk Level: {res_data['risk_level']}")
        print(f"     Analysis: {res_data['analysis']}")
    else:
        print(f"   [FAILED] Real prediction failed: {pred_res.text}")
        sys.exit(1)
        
    # Test Fake voice prediction
    print(f"\n   Uploading DEEPFAKE voice file: {os.path.basename(fake_audio_path)}")
    with open(fake_audio_path, 'rb') as f:
        files = {'file': (os.path.basename(fake_audio_path), f, 'audio/wav')}
        pred_res_fake = requests.post(f"{API_URL}/api/predict", headers=headers, files=files)
        
    if pred_res_fake.status_code == 200:
        res_data_fake = pred_res_fake.json()
        print("   [SUCCESS] Received prediction:")
        print(f"     Verdict: {res_data_fake['prediction']}")
        print(f"     Confidence: {res_data_fake['confidence']}%")
        print(f"     Risk Level: {res_data_fake['risk_level']}")
        print(f"     Analysis: {res_data_fake['analysis']}")
    else:
        print(f"   [FAILED] Fake prediction failed: {pred_res_fake.text}")
        sys.exit(1)

    # 4. Fetch Scan History
    print("\n4. Retrieving user scan history...")
    history_response = requests.get(f"{API_URL}/api/history", headers=headers)
    if history_response.status_code == 200:
        history_data = history_response.json()
        print(f"   [SUCCESS] Scans found in history: {len(history_data)} entries.")
    else:
        print(f"   [FAILED] History retrieval failed: {history_response.text}")
        sys.exit(1)

    # 5. Fetch Dashboard Stats
    print("\n5. Retrieving dashboard aggregated telemetry...")
    dashboard_response = requests.get(f"{API_URL}/api/dashboard", headers=headers)
    if dashboard_response.status_code == 200:
        db_data = dashboard_response.json()
        print("   [SUCCESS] Dashboard statistics fetched:")
        print(f"     Total Scans: {db_data['total_scans']}")
        print(f"     Fake Detected: {db_data['fake_detected']}")
        print(f"     Real Detected: {db_data['real_detected']}")
        print(f"     Avg Confidence: {db_data['avg_confidence']}%")
        print(f"     Risk Distribution: {db_data['risk_distribution']}")
    else:
        print(f"   [FAILED] Dashboard stats retrieval failed: {dashboard_response.text}")
        sys.exit(1)
        
    print("\n=== ALL BACKEND INTEGRATION TESTS PASSED ===")

if __name__ == "__main__":
    # Check if server is running, wait up to 5 seconds
    server_running = False
    for i in range(5):
        try:
            r = requests.get(API_URL)
            if r.status_code == 200:
                server_running = True
                break
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            
    if not server_running:
        print(f"Error: API server not running on {API_URL}. Start it using 'python app/main.py' before running tests.")
        sys.exit(1)
        
    run_tests()
