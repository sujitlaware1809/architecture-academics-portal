# Database Schema Reference

Complete database structure for the Architecture Academics platform.

## 📊 Database Overview

- **Database Type**: SQLite (Development) / PostgreSQL (Production recommended)
- **ORM**: SQLAlchemy 2.0
- **Location**: `backend/architecture_academics.db`
- **Tables**: 17 core tables
- **Relationships**: Extensive foreign key relationships

## 🗂️ Core Tables

### 1. User Table
**Purpose**: Store user authentication and profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | User ID |
| email | String(255) | Unique, Not Null | User email |
| hashed_password | String | Not Null | Bcrypt hashed password |
| full_name | String(255) | Not Null | User's full name |
| role | Enum | Default: USER | USER, RECRUITER, ADMIN |
| bio | Text | Nullable | User biography |
| avatar_url | String | Nullable | Profile picture URL |
| title | String(100) | Nullable | Professional title |
| company | String(100) | Nullable | Company name |
| location | String(100) | Nullable | User location |
| website | String(255) | Nullable | Personal website |
| linkedin | String(255) | Nullable | LinkedIn profile |
| twitter | String(255) | Nullable | Twitter handle |
| github | String(255) | Nullable | GitHub profile |
| is_active | Boolean | Default: True | Account status |
| created_at | DateTime | Not Null | Account creation time |
| updated_at | DateTime | Not Null | Last update time |

**Relationships**:
- One-to-Many: Blogs (author)
- One-to-Many: BlogComments
- One-to-Many: Discussions
- One-to-Many: DiscussionReplies
- One-to-Many: Courses (instructor)
- One-to-Many: Jobs (recruiter)
- Many-to-Many: BlogLikes
- Many-to-Many: CourseEnrollments
- Many-to-Many: WorkshopRegistrations

---

### 2. Blog Table
**Purpose**: Store blog posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Blog ID |
| title | String(255) | Not Null | Blog title |
| slug | String(255) | Unique, Not Null | URL-friendly slug |
| content | Text | Not Null | Blog content (markdown) |
| excerpt | Text | Nullable | Short summary |
| author_id | Integer | Foreign Key (User) | Author ID |
| category | Enum | Not Null | Blog category |
| tags | JSON | Nullable | Array of tags |
| featured | Boolean | Default: False | Featured flag |
| status | Enum | Default: published | draft/published |
| view_count | Integer | Default: 0 | View count |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Categories**: Architecture, Design, Technology, Career, Student Life, Industry News, Education, Sustainability, Projects

**Relationships**:
- Many-to-One: User (author)
- One-to-Many: BlogComments
- One-to-Many: BlogLikes

---

### 3. BlogComment Table
**Purpose**: Store comments on blog posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Comment ID |
| content | Text | Not Null | Comment content |
| blog_id | Integer | Foreign Key (Blog) | Blog ID |
| user_id | Integer | Foreign Key (User) | Commenter ID |
| parent_id | Integer | Foreign Key (self) | Parent comment (for replies) |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Relationships**:
- Many-to-One: Blog
- Many-to-One: User
- One-to-Many: CommentLikes
- Self-referential: Parent/Child comments

---

### 4. BlogLike Table
**Purpose**: Track blog likes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Like ID |
| blog_id | Integer | Foreign Key (Blog) | Blog ID |
| user_id | Integer | Foreign Key (User) | User ID |
| created_at | DateTime | Not Null | Creation time |

**Unique Constraint**: (blog_id, user_id) - One like per user per blog

---

### 5. CommentLike Table
**Purpose**: Track comment likes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Like ID |
| comment_id | Integer | Foreign Key (BlogComment) | Comment ID |
| user_id | Integer | Foreign Key (User) | User ID |
| created_at | DateTime | Not Null | Creation time |

**Unique Constraint**: (comment_id, user_id)

---

### 6. Discussion Table
**Purpose**: Store discussion/forum posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Discussion ID |
| title | String(255) | Not Null | Question title |
| content | Text | Not Null | Question details |
| author_id | Integer | Foreign Key (User) | Author ID |
| category | Enum | Not Null | Discussion category |
| tags | JSON | Nullable | Array of tags |
| view_count | Integer | Default: 0 | View count |
| is_solved | Boolean | Default: False | Has solution |
| is_pinned | Boolean | Default: False | Pinned status |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Categories**: General Discussion, Design Help, Technical Questions, Career Advice, Software & Tools, Education & Learning, Project Feedback, Industry News, Networking

**Relationships**:
- Many-to-One: User (author)
- One-to-Many: DiscussionReplies
- One-to-Many: DiscussionLikes

---

### 7. DiscussionReply Table
**Purpose**: Store replies to discussions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Reply ID |
| content | Text | Not Null | Reply content |
| discussion_id | Integer | Foreign Key (Discussion) | Discussion ID |
| user_id | Integer | Foreign Key (User) | Replier ID |
| is_solution | Boolean | Default: False | Marked as solution |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Relationships**:
- Many-to-One: Discussion
- Many-to-One: User
- One-to-Many: DiscussionReplyLikes

---

### 8. DiscussionLike Table
**Purpose**: Track discussion likes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Like ID |
| discussion_id | Integer | Foreign Key (Discussion) | Discussion ID |
| user_id | Integer | Foreign Key (User) | User ID |
| created_at | DateTime | Not Null | Creation time |

**Unique Constraint**: (discussion_id, user_id)

---

### 9. DiscussionReplyLike Table
**Purpose**: Track reply likes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Like ID |
| reply_id | Integer | Foreign Key (DiscussionReply) | Reply ID |
| user_id | Integer | Foreign Key (User) | User ID |
| created_at | DateTime | Not Null | Creation time |

**Unique Constraint**: (reply_id, user_id)

---

### 10. Course Table
**Purpose**: Store course information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Course ID |
| title | String(255) | Not Null | Course title |
| description | Text | Not Null | Course description |
| instructor_id | Integer | Foreign Key (User) | Instructor ID |
| category | String(100) | Not Null | Course category |
| level | Enum | Not Null | Beginner/Intermediate/Advanced |
| duration_hours | Integer | Not Null | Course duration |
| price | Float | Default: 0.0 | Course price |
| thumbnail_url | String | Nullable | Course thumbnail |
| is_published | Boolean | Default: False | Published status |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Relationships**:
- Many-to-One: User (instructor)
- One-to-Many: CourseModules
- Many-to-Many: CourseEnrollments
- One-to-Many: CourseReviews

---

### 11. CourseModule Table
**Purpose**: Store course modules/lessons

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Module ID |
| course_id | Integer | Foreign Key (Course) | Course ID |
| title | String(255) | Not Null | Module title |
| description | Text | Nullable | Module description |
| order | Integer | Not Null | Display order |
| video_url | String | Nullable | Video URL |
| materials_url | String | Nullable | Materials URL |
| duration_minutes | Integer | Default: 0 | Module duration |
| created_at | DateTime | Not Null | Creation time |

**Relationships**:
- Many-to-One: Course

---

### 12. CourseEnrollment Table
**Purpose**: Track course enrollments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Enrollment ID |
| course_id | Integer | Foreign Key (Course) | Course ID |
| user_id | Integer | Foreign Key (User) | Student ID |
| progress | Integer | Default: 0 | Progress percentage |
| completed | Boolean | Default: False | Completion status |
| enrolled_at | DateTime | Not Null | Enrollment time |

**Unique Constraint**: (course_id, user_id)

---

### 13. CourseReview Table
**Purpose**: Store course reviews/ratings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Review ID |
| course_id | Integer | Foreign Key (Course) | Course ID |
| user_id | Integer | Foreign Key (User) | Reviewer ID |
| rating | Integer | Not Null | Rating (1-5) |
| comment | Text | Nullable | Review comment |
| created_at | DateTime | Not Null | Creation time |

**Unique Constraint**: (course_id, user_id)

---

### 14. Workshop Table
**Purpose**: Store workshop information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Workshop ID |
| title | String(255) | Not Null | Workshop title |
| description | Text | Not Null | Workshop description |
| instructor | String(255) | Not Null | Instructor name |
| start_date | DateTime | Not Null | Start date/time |
| end_date | DateTime | Not Null | End date/time |
| location | String(255) | Not Null | Workshop location |
| capacity | Integer | Not Null | Max participants |
| price | Float | Default: 0.0 | Workshop price |
| thumbnail_url | String | Nullable | Workshop image |
| created_at | DateTime | Not Null | Creation time |

**Relationships**:
- Many-to-Many: WorkshopRegistrations

---

### 15. WorkshopRegistration Table
**Purpose**: Track workshop registrations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Registration ID |
| workshop_id | Integer | Foreign Key (Workshop) | Workshop ID |
| user_id | Integer | Foreign Key (User) | Participant ID |
| registered_at | DateTime | Not Null | Registration time |

**Unique Constraint**: (workshop_id, user_id)

---

### 16. Event Table
**Purpose**: Store event information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Event ID |
| title | String(255) | Not Null | Event title |
| description | Text | Not Null | Event description |
| date | DateTime | Not Null | Event date/time |
| location | String(255) | Not Null | Event location |
| type | String(100) | Not Null | Event type |
| capacity | Integer | Nullable | Max attendees |
| thumbnail_url | String | Nullable | Event image |
| created_at | DateTime | Not Null | Creation time |

**Relationships**:
- Many-to-Many: EventRegistrations

---

### 17. EventRegistration Table
**Purpose**: Track event registrations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Registration ID |
| event_id | Integer | Foreign Key (Event) | Event ID |
| user_id | Integer | Foreign Key (User) | Attendee ID |
| registered_at | DateTime | Not Null | Registration time |

**Unique Constraint**: (event_id, user_id)

---

### 18. Job Table
**Purpose**: Store job postings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Job ID |
| title | String(255) | Not Null | Job title |
| description | Text | Not Null | Job description |
| recruiter_id | Integer | Foreign Key (User) | Recruiter ID |
| company | String(255) | Not Null | Company name |
| location | String(255) | Not Null | Job location |
| job_type | String(50) | Not Null | Full-time/Part-time/etc |
| experience_required | String(100) | Nullable | Experience needed |
| salary_range | String(100) | Nullable | Salary range |
| requirements | JSON | Nullable | Array of requirements |
| benefits | JSON | Nullable | Array of benefits |
| is_active | Boolean | Default: True | Job status |
| created_at | DateTime | Not Null | Creation time |
| updated_at | DateTime | Not Null | Last update time |

**Relationships**:
- Many-to-One: User (recruiter)
- One-to-Many: JobApplications

---

### 19. JobApplication Table
**Purpose**: Track job applications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Application ID |
| job_id | Integer | Foreign Key (Job) | Job ID |
| user_id | Integer | Foreign Key (User) | Applicant ID |
| cover_letter | Text | Nullable | Cover letter |
| resume_url | String | Nullable | Resume URL |
| status | Enum | Default: pending | pending/reviewed/accepted/rejected |
| applied_at | DateTime | Not Null | Application time |

**Unique Constraint**: (job_id, user_id)

---

## 🔗 Relationship Diagram

```
User ──────┬─── Blogs (author)
           ├─── BlogComments
           ├─── BlogLikes
           ├─── CommentLikes
           ├─── Discussions (author)
           ├─── DiscussionReplies
           ├─── DiscussionLikes
           ├─── DiscussionReplyLikes
           ├─── Courses (instructor)
           ├─── CourseEnrollments
           ├─── CourseReviews
           ├─── WorkshopRegistrations
           ├─── EventRegistrations
           ├─── Jobs (recruiter)
           └─── JobApplications

Blog ──────┬─── BlogComments
           └─── BlogLikes

BlogComment ── CommentLikes

Discussion ─┬─── DiscussionReplies
            └─── DiscussionLikes

DiscussionReply ── DiscussionReplyLikes

Course ────┬─── CourseModules
           ├─── CourseEnrollments
           └─── CourseReviews

Workshop ── WorkshopRegistrations

Event ───── EventRegistrations

Job ─────── JobApplications
```

## 🔐 Enums Used

### UserRole
- `USER`: Regular user
- `RECRUITER`: Can post jobs
- `ADMIN`: Full access

### BlogStatus
- `draft`: Not published
- `published`: Published and visible

### BlogCategory / DiscussionCategory
- Architecture
- Design
- Technology
- Career
- Student Life
- Industry News
- Education
- Sustainability
- Projects
- (Discussion-specific) General Discussion, Design Help, Technical Questions, Software & Tools, Project Feedback, Networking

### CourseLevel
- `Beginner`
- `Intermediate`
- `Advanced`

### JobApplicationStatus
- `pending`: Not yet reviewed
- `reviewed`: Under review
- `accepted`: Accepted
- `rejected`: Rejected

## 📝 Indexes

**Recommended indexes for performance**:
- `users.email` (Unique)
- `blogs.slug` (Unique)
- `blogs.author_id`
- `blogs.category`
- `blogs.created_at`
- `discussions.author_id`
- `discussions.category`
- `discussions.is_solved`
- `courses.instructor_id`
- `jobs.recruiter_id`
- `jobs.is_active`

## 🎯 Sample Queries

### Get all blogs with author info
```sql
SELECT blogs.*, users.full_name, users.avatar_url
FROM blogs
JOIN users ON blogs.author_id = users.id
WHERE blogs.status = 'published'
ORDER BY blogs.created_at DESC;
```

### Get discussion with reply count
```sql
SELECT discussions.*, COUNT(discussion_replies.id) as reply_count
FROM discussions
LEFT JOIN discussion_replies ON discussions.id = discussion_replies.discussion_id
GROUP BY discussions.id
ORDER BY discussions.created_at DESC;
```

### Get enrolled courses for user
```sql
SELECT courses.*, course_enrollments.progress
FROM courses
JOIN course_enrollments ON courses.id = course_enrollments.course_id
WHERE course_enrollments.user_id = ?;
```

---

**Last Updated**: January 2025
