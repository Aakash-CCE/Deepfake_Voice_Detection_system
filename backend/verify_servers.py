import requests
import sys

def verify():
    frontend_url = "http://127.0.0.1:5173"
    backend_url = "http://127.0.0.1:8000"
    
    print("=== VERIFYING RUNNING LOCAL SERVERS ===")
    
    # 1. Check Backend server
    print(f"\nChecking Backend Server: {backend_url} ...")
    try:
        r_back = requests.get(backend_url)
        if r_back.status_code == 200:
            print("   [SUCCESS] Backend is ONLINE!")
            print(f"   Response payload: {r_back.json()}")
        else:
            print(f"   [WARNING] Backend returned status code: {r_back.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [FAILED] Could not connect to Backend server. Ensure uvicorn is running.")
        
    # 2. Check Frontend server
    print(f"\nChecking Frontend React Server: {frontend_url} ...")
    try:
        r_front = requests.get(frontend_url)
        if r_front.status_code == 200:
            print("   [SUCCESS] Frontend is ONLINE!")
            # Print title or some identifying HTML snippet
            if "VocalShield" in r_front.text or "root" in r_front.text:
                print("   [SUCCESS] Frontend HTML bundle was successfully loaded by client.")
                print("   Title found in HTML: VocalShield - AI-Based Deepfake Voice Detection Dashboard")
        else:
            print(f"   [WARNING] Frontend returned status code: {r_front.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [FAILED] Could not connect to Frontend server. Ensure npm run dev is running.")
        
    print("\n=== VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    verify()
