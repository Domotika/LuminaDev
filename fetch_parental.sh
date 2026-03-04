#!/bin/bash
HOST="https://192.168.100.1"
USER="admin"
PASS="Da155201##"
COOKIE_FILE="router_cookie.txt"

# 1. Get Token
TOKEN=$(curl -k -s -X POST "$HOST/asp/GetRandCount.asp")
# echo "Token: $TOKEN"

# 2. Encode Pass
PASS_B64=$(echo -n "$PASS" | base64)

# 3. Login & Save Cookie
# We must send the initial cookie manually
curl -k -s -c $COOKIE_FILE -b "Cookie=body:Language:english:id=-1" \
  -d "UserName=$USER&PassWord=$PASS_B64&Language=english&x.X_HW_Token=$TOKEN" \
  "$HOST/login.cgi" > /dev/null

# 4. Fetch Parental Control Page
# Referer is often required by these routers
curl -k -s -b $COOKIE_FILE \
  -H "Referer: $HOST/login.cgi" \
  "$HOST/html/bbsp/parentalctrl/parentalctrlstatus.asp" > parental_page.html

# 5. Extract Profile Names (grep logic)
# Looking for typical Huawei JS array structures or table rows
echo "--- Page Content Preview ---"
head -n 20 parental_page.html
echo "--- Searching for Profiles ---"
grep -i "Restrito" parental_page.html
grep -i "Hora" parental_page.html
