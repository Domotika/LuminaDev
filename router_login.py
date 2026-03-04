import requests
import base64
import re
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

URL = "https://192.168.100.1"
USER = "admin"
PASS = "Da155201##"

s = requests.Session()
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
})

# 1. Get Token
print("Getting token...")
try:
    r = s.post(f"{URL}/asp/GetRandCount.asp", verify=False)
    token = r.text.strip()
    print(f"Token: {token}")
except Exception as e:
    print(f"Error getting token: {e}")
    exit(1)

# 2. Prepare Login
# Set the initial cookie as the JS does
# Cookie=body:Language:english:id=-1
s.cookies.set("Cookie", "body:Language:english:id=-1")

pass_b64 = base64.b64encode(PASS.encode()).decode()

payload = {
    "UserName": USER,
    "PassWord": pass_b64,
    "Language": "english",
    "x.X_HW_Token": token
}

# 3. Login
print("Logging in...")
r = s.post(f"{URL}/login.cgi", data=payload, verify=False)
print(f"Login Status: {r.status_code}")
print(f"Login Body Snippet: {r.text[:200]}")

# 4. Check if we are in
print("Checking dashboard...")
r = s.get(f"{URL}/", verify=False)
if "login.css" in r.text:
    print("FAILED: Still on login page.")
else:
    print("SUCCESS: Logged in!")
    print(r.text[:500])
    
    # Try to find Parental Control link
    if "parental" in r.text.lower():
        print("Found 'parental' string in dashboard.")
