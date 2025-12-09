# Deployment Checklist

## 1. Environment Variables
Ensure these environment variables are set on your production server (e.g., Vercel, AWS, DigitalOcean).

### Frontend (.env.local / Environment Variables)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-secret-key
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/dbname  # If using PostgreSQL in prod
# OR
DATABASE_URL=sqlite:///./architecture_academics.db       # If sticking with SQLite (not recommended for high traffic)

SECRET_KEY=your-backend-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
CORS_ORIGINS=https://your-frontend-domain.com
```

## 2. Backend Deployment
1.  **Install Dependencies**: `pip install -r requirements.txt`
2.  **Database Migration**: 
    - If using a new DB, run `python seed_all.py` to initialize data.
    - Or ensure your migration scripts run.
3.  **Run Server**: Use a production server like Gunicorn or Uvicorn with workers.
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
    ```

## 3. Frontend Deployment
1.  **Build**: `npm run build` (You've already verified this works!)
2.  **Start**: `npm start`

## 4. Verification
- Check the `/docs` endpoint on your backend to ensure it's running.
- Check the Search page and Dashboard on frontend.
- Verify "My Applications" and "Blogs" load correctly (we fixed the API URLs there).
