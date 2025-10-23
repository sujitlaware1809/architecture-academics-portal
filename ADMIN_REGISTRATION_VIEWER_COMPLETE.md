# Admin Registration Viewer - Implementation Complete

## Overview
Admins can now view the list of registered users for both events and workshops, including user names and email addresses.

## Backend Changes (backend/main.py)

### 1. Event Registrations Endpoint
**Location**: Lines 2872-2917

```python
@app.get("/admin/events/{event_id}/registrations")
async def admin_get_event_registrations(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all registrations for an event with user details"""
```

**Returns**:
```json
{
  "event_id": 1,
  "event_title": "Event Name",
  "total_registrations": 5,
  "registrations": [
    {
      "registration_id": 1,
      "registered_at": "2024-01-15T10:30:00",
      "attended": false,
      "user": {
        "id": 10,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe"
      }
    }
  ]
}
```

### 2. Workshop Registrations Endpoint
**Location**: Lines 3032-3077

```python
@app.get("/admin/workshops/{workshop_id}/registrations")
async def admin_get_workshop_registrations(
    workshop_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all registrations for a workshop with user details"""
```

Same response structure as events endpoint.

## Frontend Changes

### 1. Admin Events Page (app/admin/events/page.tsx)

#### Imports Added
```typescript
import { Eye, Mail, User, X } from 'lucide-react';
```

#### State Variables Added
```typescript
const [showRegistrations, setShowRegistrations] = useState(false);
const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<any>(null);
const [loadingRegistrations, setLoadingRegistrations] = useState(false);
```

#### Handler Function
```typescript
const handleViewRegistrations = async (event: Event) => {
  setLoadingRegistrations(true);
  setShowRegistrations(true);
  try {
    const response = await api.get(`/admin/events/${event.id}/registrations`);
    setSelectedEventRegistrations(response.data);
  } catch (err: any) {
    console.error("Error fetching registrations:", err);
    setError(err.response?.data?.detail || "Failed to load registrations");
  } finally {
    setLoadingRegistrations(false);
  }
};
```

#### View Registrations Button
Added eye icon button in the actions column (before Edit button):
```typescript
<Button
  size="sm"
  variant="outline"
  onClick={() => handleViewRegistrations(event)}
  title="View Registrations"
>
  <Eye className="h-4 w-4" />
</Button>
```

#### Registrations Modal
Full-screen modal displaying:
- Event title
- Total registration count
- Table with columns:
  - Name (with user icon)
  - Email (with mail icon)
  - Registered At (formatted date/time)
  - Attended (Yes/No badge)
- Loading spinner during fetch
- Empty state for no registrations
- Close button

### 2. Admin Workshops Page (app/admin/workshops/page.tsx)

Applied identical implementation as events page:
- Same imports (Eye, Mail, User, X)
- Same state variables (showRegistrations, selectedWorkshopRegistrations, loadingRegistrations)
- Same handler function (handleViewRegistrations with workshop endpoint)
- Same button placement
- Same modal structure

## Features

### For Admins:
1. **View Registrations Button**: Eye icon button next to Edit/Delete in actions column
2. **Registration Modal**: 
   - Shows event/workshop title
   - Displays total count with purple badge
   - Lists all registered users in a table
   - Shows full name, email, registration timestamp, attendance status
   - Loading state with spinner
   - Empty state when no registrations
3. **User Details**: 
   - Full name displayed prominently
   - Email address for contact
   - Registration date/time formatted clearly
   - Attendance tracking (Yes/No badges)

### Data Flow:
1. Admin clicks eye icon on event/workshop
2. Frontend calls `/admin/events/{id}/registrations` or `/admin/workshops/{id}/registrations`
3. Backend queries EventRegistration/WorkshopRegistration joined with User table
4. Returns full user details including names
5. Modal displays data in formatted table
6. Admin can close modal to continue managing events/workshops

## Testing Checklist

- [ ] Create an event as admin
- [ ] Register for the event as a user (from public events page)
- [ ] Log back in as admin
- [ ] Click the eye icon on the registered event
- [ ] Verify modal shows user's full name and email
- [ ] Verify registration timestamp is displayed
- [ ] Check empty state for events with no registrations
- [ ] Repeat for workshops

## Technical Notes

- Uses direct JOIN queries for performance (avoids N+1 query issues)
- Proper error handling with user-friendly messages
- Loading states for better UX
- Responsive modal design with max-height scrolling
- Consistent styling with existing admin dashboard
- No breaking changes to existing functionality

## Database Queries

Both endpoints use efficient SQL JOINs:
```sql
SELECT 
  event_registrations.*, 
  users.id, 
  users.email, 
  users.first_name, 
  users.last_name,
  (users.first_name || ' ' || users.last_name) as full_name
FROM event_registrations
JOIN users ON event_registrations.participant_id = users.id
WHERE event_registrations.event_id = ?
ORDER BY event_registrations.registered_at DESC
```

## Security

- Both endpoints require admin authentication (`get_current_admin` dependency)
- Returns 404 if event/workshop doesn't exist
- Returns 403 if user is not an admin
- No sensitive user data exposed (only name and email)

## Status
✅ Backend endpoints implemented  
✅ Frontend UI complete for events  
✅ Frontend UI complete for workshops  
✅ No compilation errors  
✅ Ready for testing
