# Token Storage Mismatch Fix - Registration Working! ✅

## Problem
Users could login successfully (200 OK) but when trying to register for events:
- Login page stored token as `access_token`
- Event/Workshop cards checked for `token`
- Result: Cards thought user wasn't logged in
- Users kept being redirected to login page

**Symptoms:**
```
INFO: POST /auth/login HTTP/1.1 200 OK  ✅ Login works
INFO: GET /events HTTP/1.1 200 OK       ✅ Events load
GET /login?redirect=/events 200         ❌ Redirected to login (shouldn't happen!)
```

## Root Cause

### Token Storage Inconsistency

**Login stores as:**
```typescript
// lib/api.ts - login function
localStorage.setItem('access_token', data.access_token);  // ✅
localStorage.setItem('user', JSON.stringify(data.user));
```

**Event/Workshop cards checked for:**
```typescript
// components/events/event-card.tsx
const token = localStorage.getItem('token')  // ❌ Wrong key!
```

**API helper correctly used:**
```typescript
// lib/api.ts - getStoredToken()
return localStorage.getItem('access_token');  // ✅
```

### Missing Redirect Handling

Login page didn't handle `?redirect=/events` parameter, so after login users went to homepage instead of back to events.

## Solution

### 1. Fixed Token Check in Event Card (`components/events/event-card.tsx`)

**Changed token check:**
```typescript
// Before
const token = localStorage.getItem('token')  ❌

// After
const token = localStorage.getItem('access_token')  ✅
```

**Fixed token cleanup:**
```typescript
// Before
localStorage.removeItem('token')

// After
localStorage.removeItem('access_token')
localStorage.removeItem('user')  // Also clear user data
```

### 2. Fixed Token Check in Workshop Card (`components/workshops/workshop-card.tsx`)

Same fixes as event card.

### 3. Added Redirect Handling in Login Page (`app/login/page.tsx`)

**Added redirect parameter handling:**
```typescript
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    // Get redirect parameter from URL
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    // ... login logic ...
    
    if (result.data) {
      // Check if there's a redirect URL first
      if (redirectTo) {
        router.push(redirectTo)  // ✅ Go back to events/workshops
        return
      }
      
      // Otherwise, check user role and redirect accordingly
      // ... existing role-based routing ...
    }
  }
}
```

## How It Works Now

### User Flow: Not Logged In

1. User visits `/events`
2. Clicks "Register Now"
3. Card checks `localStorage.getItem('access_token')`
4. Not found → Show "Login Required" toast
5. Redirect to `/login?redirect=/events` after 1.5s
6. User logs in
7. Login detects `redirect=/events` parameter
8. Redirects to `/events` ✅
9. User clicks "Register Now" again
10. Token found → API call successful → "Success! 🎉"

### User Flow: Already Logged In

1. User visits `/events` (already logged in)
2. Clicks "Register Now"
3. Card checks `localStorage.getItem('access_token')`
4. Found ✅ → Makes API call
5. Backend validates token ✅
6. Registration successful
7. Button shows "✓ Registered"
8. Toast: "Success! 🎉"

### User Flow: Expired Token

1. User visits `/events` (has old token)
2. Clicks "Register Now"
3. Card checks `localStorage.getItem('access_token')`
4. Found, but expired
5. API call returns 401 Unauthorized
6. Card detects auth error
7. Shows "Session Expired" toast
8. Clears `access_token` and `user` from localStorage
9. Redirects to `/login?redirect=/events` after 1.5s
10. User logs in
11. Returns to `/events`
12. Registration works! ✅

## Changes Summary

### Files Modified: 3

1. **`components/events/event-card.tsx`**
   - Changed `localStorage.getItem('token')` → `localStorage.getItem('access_token')`
   - Changed `localStorage.removeItem('token')` → Remove both `access_token` and `user`

2. **`components/workshops/workshop-card.tsx`**
   - Same changes as event card

3. **`app/login/page.tsx`**
   - Added `useSearchParams` hook
   - Added `redirectTo` state
   - Added `useEffect` to capture redirect parameter
   - Added redirect check in login success handler

## Testing

### Test Case 1: Fresh Login → Register
```
1. Clear localStorage
2. Go to /events
3. Click "Register Now"
   → Toast: "Login Required"
   → Wait 1.5s
   → Redirects to /login?redirect=/events
4. Enter credentials, click "Sign In"
   → Redirects back to /events ✅
5. Click "Register Now"
   → Toast: "Success! 🎉" ✅
   → Button: "✓ Registered" ✅
```

### Test Case 2: Already Logged In
```
1. Already logged in (access_token in localStorage)
2. Go to /events
3. Click "Register Now"
   → Toast: "Success! 🎉" ✅
   → Button: "✓ Registered" ✅
```

### Test Case 3: Expired Token
```
1. Have old expired token in localStorage
2. Go to /events
3. Click "Register Now"
   → Toast: "Session Expired" ✅
   → localStorage cleared
   → Redirects to /login?redirect=/events
4. Login again
   → Returns to /events ✅
5. Registration works ✅
```

## Token Storage Standard

**Going forward, always use:**
```typescript
// Storing token
localStorage.setItem('access_token', token)
localStorage.setItem('user', JSON.stringify(user))

// Reading token
const token = localStorage.getItem('access_token')
const user = JSON.parse(localStorage.getItem('user') || 'null')

// Checking if logged in
const isLoggedIn = !!localStorage.getItem('access_token')

// Clearing on logout
localStorage.removeItem('access_token')
localStorage.removeItem('user')

// Or use api helper
const token = api.getStoredToken()
const isLoggedIn = api.isAuthenticated()
```

## Result

✅ **Registration now works perfectly!**
- Token storage is consistent
- Login redirect works
- Clear error messages
- Automatic token cleanup
- Smooth user experience

## What User Should See Now

1. **Not logged in:**
   - Click "Register Now"
   - See: "Login Required - Please login to register for this event"
   - Auto-redirect to login
   - After login, return to events page
   - Click register again → Success!

2. **Logged in:**
   - Click "Register Now"
   - See: "Success! 🎉 - You have successfully registered for this event"
   - Button changes to: "✓ Registered" (green)

3. **Session expired:**
   - Click "Register Now"
   - See: "Session Expired - Please login again to register"
   - Auto-redirect to login
   - After login, return to events page
   - Click register again → Success!

🎉 **Event and workshop registration fully working!**
