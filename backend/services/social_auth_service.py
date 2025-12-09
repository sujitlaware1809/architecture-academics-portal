import os
import httpx
from urllib.parse import urlencode

# Google Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

# Outlook Configuration
OUTLOOK_CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID")
OUTLOOK_CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET")
OUTLOOK_REDIRECT_URI = os.getenv("OUTLOOK_REDIRECT_URI", "http://localhost:8000/api/auth/outlook/callback")

async def get_google_login_url():
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise Exception("Google Client ID and Secret are not configured")
        
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "access_type": "offline",
        "prompt": "consent"
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

async def get_google_user_info(code: str):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        }
        token_res = await client.post(token_url, data=token_data)
        token_res.raise_for_status()
        tokens = token_res.json()
        
        # Get user info
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_res = await client.get(user_info_url, headers=headers)
        user_res.raise_for_status()
        return user_res.json()

async def get_outlook_login_url():
    if not OUTLOOK_CLIENT_ID or not OUTLOOK_CLIENT_SECRET:
        raise Exception("Outlook Client ID and Secret are not configured")

    params = {
        "client_id": OUTLOOK_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": OUTLOOK_REDIRECT_URI,
        "response_mode": "query",
        "scope": "User.Read offline_access openid profile email",
        "state": "12345" # Should be random
    }
    return f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?{urlencode(params)}"

async def get_outlook_user_info(code: str):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
        token_data = {
            "client_id": OUTLOOK_CLIENT_ID,
            "client_secret": OUTLOOK_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": OUTLOOK_REDIRECT_URI,
        }
        token_res = await client.post(token_url, data=token_data)
        token_res.raise_for_status()
        tokens = token_res.json()
        
        # Get user info
        user_info_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_res = await client.get(user_info_url, headers=headers)
        user_res.raise_for_status()
        return user_res.json()
