from google import genai
import os
from dotenv import load_dotenv
import sys

# 1. Load env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print("--- STARTING TEST ---")
print(f"Checking API Key: {api_key[:10]}... (Total length: {len(api_key) if api_key else 0})")

if not api_key:
    print("ERROR: No API Key found in .env file!")
    sys.exit()

try:
    # 2. Initialize Client
    print("Step 1: Initializing Client (v1 stable)...")
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})
    
    # 3. Call Model
    print("Step 2: Requesting content from gemini-1.5-flash...")
    response = client.models.generate_content(
        model="gemini-1.5-flash", 
        contents="Say 'System Online'"
    )
    
    # 4. Print Result
    print("-" * 30)
    if response and hasattr(response, 'text'):
        print(f"SUCCESS: {response.text}")
    else:
        print("FAILED: Response received but has no text content.")
    print("-" * 30)

except Exception as e:
    print(f"CRITICAL ERROR: {str(e)}")

print("--- TEST FINISHED ---")