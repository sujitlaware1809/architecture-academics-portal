# Events Not Showing - Debugging Steps ✅

## Issue: Events created from admin dashboard still not appearing on public `/events` page

## Changes Made:

### 1. Removed Status Filtering Temporarily
To debug the issue, I've removed all status filtering from the public endpoints:

**File: `backend/main.py`**

```python
# BEFORE (with filtering)
@app.get("/events")
async def get_public_events(...):
    all_events = crud.get_events(db, skip=skip, limit=limit)
    return [e for e in all_events if e.status in ["upcoming", "ongoing"]]

# AFTER (no filtering - shows ALL events)
@app.get("/events")
async def get_public_events(...):
    return crud.get_events(db, skip=skip, limit=limit)
```

Same change for `/workshops` endpoint.

---

## 🔴 CRITICAL STEPS TO FIX:

### Step 1: ⚠️ RESTART BACKEND SERVER
The backend MUST be restarted for changes to take effect!

**In WSL Terminal:**
```bash
# Stop current server (Ctrl+C if running)
cd /mnt/e/Projects/client/Suresh_Sir_Arch/backend
source venv/bin/activate
python run_server.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Verify Backend is Running
Open browser and go to: `http://127.0.0.1:8000/docs`
- You should see the FastAPI documentation page
- Look for the `/events` endpoint

### Step 3: Test API Directly
In browser, go to: `http://127.0.0.1:8000/events`
- Should return JSON array of events
- If empty `[]`, no events exist in database
- If has data, events exist and API is working

### Step 4: Check Database
Let's verify events actually exist in the database:

**Option A: Using Python (in WSL):**
```bash
cd /mnt/e/Projects/client/Suresh_Sir_Arch/backend
source venv/bin/activate
python << 'EOF'
from database import SessionLocal, Event
db = SessionLocal()
events = db.query(Event).all()
print(f"\n📊 Total events in database: {len(events)}")
for event in events:
    print(f"  ✅ ID: {event.id} | Title: {event.title} | Status: {event.status}")
db.close()
EOF
```

**Option B: Check the SQLite database file:**
```bash
# In backend directory
ls -lh architecture_academics.db
# Should show file exists and has size > 0
```

### Step 5: Test Frontend
After backend is running:
1. Go to `http://localhost:3000/events`
2. Open browser DevTools (F12) → Network tab
3. Look for the request to `/events`
4. Check if it returns data

---

## Debugging Checklist:

### ✅ Backend Issues:
- [ ] Backend server restarted after code changes?
- [ ] Backend running on `http://127.0.0.1:8000`?
- [ ] Can access `http://127.0.0.1:8000/docs`?
- [ ] API endpoint `/events` returns data when accessed directly?
- [ ] Database file `architecture_academics.db` exists?
- [ ] Events exist in database table?

### ✅ Frontend Issues:
- [ ] Frontend calling correct API URL (`http://127.0.0.1:8000/events`)?
- [ ] CORS enabled in backend for frontend origin?
- [ ] Browser console showing any errors?
- [ ] Network tab shows 200 OK response from `/events`?

### ✅ Data Issues:
- [ ] Actually created an event from `/admin/events`?
- [ ] Event saved successfully (no errors in admin dashboard)?
- [ ] Event has all required fields filled?

---

## Common Issues:

### Issue 1: "Connection Refused" or "Network Error"
**Cause**: Backend not running
**Fix**: Start backend server (see Step 1)

### Issue 2: API returns `[]` (empty array)
**Cause**: No events in database
**Fix**: 
1. Login to admin dashboard
2. Go to `/admin/events`
3. Create a new event
4. Refresh `/events` page

### Issue 3: CORS Error
**Cause**: Frontend origin not allowed
**Check**: Backend should have CORS middleware configured
```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: 404 Not Found
**Cause**: Wrong API URL
**Check**: Frontend should call `http://127.0.0.1:8000/events` not `/api/events`

---

## Test Commands:

### Test 1: Check if backend is responding
```bash
curl http://127.0.0.1:8000/events
```

### Test 2: Check event count
```bash
cd /mnt/e/Projects/client/Suresh_Sir_Arch/backend
source venv/bin/activate
python -c "from database import SessionLocal, Event; db = SessionLocal(); print(f'Events: {db.query(Event).count()}'); db.close()"
```

### Test 3: Create test event via API
```bash
curl -X POST http://127.0.0.1:8000/admin/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "date": "2025-12-01T10:00:00",
    "duration": 2
  }'
```

---

## Expected Flow:

```
Admin Dashboard (/admin/events)
    ↓
Click "Create Event"
    ↓
Fill form & Submit
    ↓
POST /admin/events (Backend)
    ↓
Event saved to database
    ↓
Public page (/events) 
    ↓
GET /events (Backend)
    ↓
Returns ALL events from database
    ↓
Frontend displays events
```

---

## Next Steps:

1. **RESTART BACKEND** (most important!)
2. Check if `http://127.0.0.1:8000/events` returns data
3. If returns data but frontend doesn't show, it's a frontend issue
4. If returns empty `[]`, create an event from admin dashboard
5. Share the output/errors you see

---

## Files Modified:

- ✅ `backend/main.py` - Lines 2738-2747 (Events endpoint - removed filtering)
- ✅ `backend/main.py` - Lines 2750-2757 (Workshops endpoint - removed filtering)

---

## Additional Logging (Optional):

Add this to the events endpoint to see what's happening:

```python
@app.get("/events", response_model=List[schemas.EventResponse])
async def get_public_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = crud.get_events(db, skip=skip, limit=limit)
    print(f"🔍 DEBUG: Found {len(events)} events in database")
    for e in events:
        print(f"  - Event {e.id}: {e.title} (status: {e.status})")
    return events
```

Then check backend terminal for the debug output.

---

**🚨 MOST IMPORTANT: RESTART THE BACKEND SERVER!** 🚨

Without restarting, code changes won't take effect!
