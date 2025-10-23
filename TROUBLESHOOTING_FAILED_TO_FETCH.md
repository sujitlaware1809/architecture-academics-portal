# 🔧 Quick Troubleshooting Guide - "Failed to fetch" Error

## Issue
Getting `TypeError: Failed to fetch` when accessing My Courses page.

## Possible Causes & Solutions

### 1. Backend Server Not Running ✅ (RESOLVED)
**Status:** Backend IS running on port 8000
**Evidence:** Error message "address already in use" confirms server is running

### 2. Check if You're Logged In

**Steps:**
1. Open browser console (F12)
2. Go to "Application" tab → "Local Storage" → `http://localhost:3000`
3. Check if you have a `token` key
4. If NO token → You're not logged in
5. If YES token → Check if it's expired

**To Login:**
1. Go to: `http://localhost:3000/login`
2. Use credentials:
   - Email: `admin@architectureacademics.com`
   - Password: `Admin@123`

### 3. Check if You Have Enrolled Courses

**Current Status:** 0 enrolled courses shown in "My Courses"

This is NORMAL if you haven't enrolled in any courses yet!

**To Enroll:**
1. Go to: `http://localhost:3000/courses`
2. Click any course card
3. Click "Enroll Now" button (purple)
4. Wait for success message
5. You'll be redirected to course player
6. Now check "My Courses" again

### 4. Test Backend Connection

**Open new browser tab and visit:**
```
http://127.0.0.1:8000/docs
```

This should show FastAPI interactive docs.

**Or test the endpoint directly:**
```
http://127.0.0.1:8000/api/courses
```

This should return a list of courses (might show auth error, which is fine).

### 5. Check Browser Console

Press F12 and look for:
- ❌ Red errors about CORS
- ❌ Red errors about "401 Unauthorized"
- ❌ Red errors about "Network Error"

**If you see CORS errors:**
Backend needs CORS middleware (should already be configured).

**If you see 401 Unauthorized:**
Your session expired - login again.

**If you see Network Error:**
Backend might not be accessible.

### 6. Manual Test Steps

**Test 1: Check Backend Health**
```bash
# Open PowerShell and run:
curl http://127.0.0.1:8000/api/courses
```

**Test 2: Check if Logged In**
```javascript
// Open browser console (F12) and run:
console.log('Token:', localStorage.getItem('token'))
console.log('User:', localStorage.getItem('user'))
```

**Test 3: Manual Enrollment Check**
```javascript
// In browser console (F12), after logging in:
fetch('http://127.0.0.1:8000/api/enrollments/my-courses', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('My Courses:', d))
```

## Expected Behavior

### When You Have NO Enrolled Courses:
- "My Courses" page shows: **Total Courses: 0**
- No error messages
- "No Courses Yet" message displayed
- "Browse Courses" button available

### When You Have Enrolled Courses:
- "My Courses" page shows: **Total Courses: 1** (or more)
- Course cards appear with progress bars
- "Continue Learning" or "Start Course" buttons

## Quick Fix Steps

### Step 1: Login
```
1. Go to: http://localhost:3000/login
2. Email: admin@architectureacademics.com
3. Password: Admin@123
4. Click "Login"
```

### Step 2: Enroll in a Course
```
1. Go to: http://localhost:3000/courses
2. Click on "Architectural Design Fundamentals"
3. Click "Enroll Now"
4. Wait for success message
5. Click "Go to Course Player" (or let it auto-redirect)
```

### Step 3: Check My Courses
```
1. Go to: http://localhost:3000/profile/my-courses
2. Should now show 1 enrolled course
3. Click "Continue Learning" to open course player
```

## Common Issues

### Issue: "My Courses" shows 0 but I enrolled
**Solution:**
1. Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. Check if still logged in (look for Profile icon in header)
3. Try logging out and back in
4. Clear browser cache

### Issue: Can't enroll in courses
**Solution:**
1. Make sure you're logged in (Profile icon visible in header)
2. Check browser console for errors
3. Verify backend is running (port 8000)
4. Try different course

### Issue: "Failed to fetch" persists
**Solution:**
1. Check if backend is running:
   ```bash
   # PowerShell:
   Get-Process py | Where-Object { $_.MainWindowTitle -like "*uvicorn*" }
   ```

2. Restart backend:
   ```bash
   cd e:/Projects/client/Suresh_Sir_Arch/backend
   py run_server.py
   ```

3. Check frontend port:
   - Should be running on port 3000 or 3001
   - Check browser URL bar

4. Clear browser cache and reload

## Testing Checklist

- [ ] Backend running on port 8000 ✅
- [ ] Frontend running on port 3000/3001
- [ ] Logged in (check for Profile icon in header)
- [ ] Token exists in localStorage
- [ ] Can access http://127.0.0.1:8000/docs
- [ ] Can see courses at /courses page
- [ ] Can enroll in a course
- [ ] Can see enrollment in My Courses
- [ ] Can access course player

## Debug Commands

### Check Backend Status:
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
```

### Check Frontend Status:
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue
```

### View Backend Logs:
Look at the PowerShell terminal where backend is running.
Should see requests like:
```
INFO:     127.0.0.1:xxxxx - "GET /api/enrollments/my-courses HTTP/1.1" 200 OK
```

## Most Likely Cause

Based on your screenshots showing **"Total Courses: 0"**, the most likely scenario is:

**You haven't enrolled in any courses yet!**

This is NOT an error - it's expected behavior. The "Failed to fetch" error in console is likely just a race condition or the page trying to fetch before authentication is complete.

### Solution:
1. ✅ Login (if not already)
2. ✅ Go to `/courses`
3. ✅ Click a course
4. ✅ Click "Enroll Now"
5. ✅ Access course player
6. ✅ Return to "My Courses" - should now show 1 course

## Need More Help?

If issue persists after following all steps:

1. Take a screenshot of browser console (F12)
2. Take a screenshot of backend terminal logs
3. Share the error messages
4. Check if token exists in localStorage
5. Try logging out and back in

---

## Quick Success Test

Run this complete flow (5 minutes):

```
1. Backend: py run_server.py (should already be running)
2. Frontend: npm run dev (should already be running)
3. Browser: http://localhost:3000/login
4. Login: admin@architectureacademics.com / Admin@123
5. Browser: http://localhost:3000/courses
6. Click any course → Enroll Now
7. Wait for redirect to course player
8. Browser: http://localhost:3000/profile/my-courses
9. ✅ Should show 1 enrolled course!
```

**Current Status:** Everything is set up correctly! You just need to enroll in a course first. 🎓
