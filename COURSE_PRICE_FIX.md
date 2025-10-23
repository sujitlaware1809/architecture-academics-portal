# Course Price Field & Frontend Data Mapping Fix

## Issue
Backend was throwing a 500 error when creating courses:
```
sqlite3.IntegrityError: NOT NULL constraint failed: courses.price
```

Frontend was also crashing with:
```
Error: Cannot read properties of undefined (reading 'slice')
```

## Root Cause
1. **Backend**: The `courses` table in the database had a `price` column constraint but the Pydantic schemas and API didn't include it
2. **Frontend**: The courses page expected a different data structure than what the backend API returns (missing `tags`, `thumbnail`, `rating`, etc.)

## Solution

### Backend Changes

#### 1. Updated Schemas (`backend/schemas.py`)
- Added `price: float = 0.0` to `CourseBase`
- Added `price: Optional[float] = None` to `CourseUpdate`

#### 2. Updated Database Model (`backend/database.py`)
- Added `price = Column(Numeric(10, 2), nullable=False, default=0.0)` to `Course` model

#### 3. Migration Script (`backend/migrate_db.py`)
- Added migration to ensure `price` column exists in existing databases
- Migration sets default value of 0 for free courses

#### 4. Frontend Admin Page (`app/admin/courses/page.tsx`)
- Added `price` field to Course interface
- Added price input field to the course creation/edit form
- Added price handling in form submission
- Form includes validation and defaults to 0 for free courses

### Frontend Data Mapping

#### 5. Courses Portal Page (`app/courses/page.tsx`)
- Added data transformation layer to map backend response to frontend interface:
  ```typescript
  const transformedCourses = response.data.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description || '',
    thumbnail: course.image_url || '/placeholder-course.jpg',
    tags: [course.level || 'beginner'], // Use level as primary tag
    rating: 4.5, // Default rating
    students: course.enrolled_count || 0,
    duration: course.duration || '8 weeks',
    lastUpdated: course.updated_at || course.created_at,
    isFree: !course.price || course.price === 0,
    hasFreePreview: course.has_free_preview || false,
    totalLessons: course.total_lessons || 0,
    freeLessons: course.has_free_preview ? 1 : 0,
    isNew: false,
    isTrending: false,
    syllabus: course.syllabus ? [course.syllabus] : [],
    lessons: []
  }))
  ```
- Added null-safety checks for tags array: `(course.tags || [])`

## Testing

### To Test Backend Fix:
1. Restart the backend server
2. Login as admin
3. Navigate to Admin Dashboard → Courses
4. Click "Add Course"
5. Fill in the form (price defaults to 0 for free courses)
6. Submit - should now work without 500 error

### To Test Frontend Fix:
1. Navigate to `/courses` page
2. Page should load without crash
3. All course cards should display properly
4. Tags should render correctly (showing course level)

## Database Schema

The `courses` table now has:
- `price` NUMERIC(10,2) NOT NULL DEFAULT 0.0

This allows for:
- Free courses (price = 0)
- Paid courses (price > 0)
- Proper currency handling with 2 decimal precision

## Notes
- All existing courses in the database should be migrated with price = 0 (free)
- The admin form allows editing price for any course
- The frontend determines if a course is free based on: `!course.price || course.price === 0`
- The transformation layer ensures backward compatibility between backend API and frontend expectations
