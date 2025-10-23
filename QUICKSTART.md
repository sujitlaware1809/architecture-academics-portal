# 🚀 Quick Start Guide

Get the Architecture Academics platform up and running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
-  Python 3.12 or higher
-  Node.js 18 or higher
-  npm or pnpm package manager

## 🎯 Quick Setup (Windows)

### Step 1: Backend Setup (2 minutes)

```powershell
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv winvenv
.\winvenv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server
python run_server.py
```

**Expected Output:**
```
✅ Predefined admin account created/verified
📧 Email: admin@architectureacademics.com
🔑 Password: Admin@123

✅ Predefined recruiter account created/verified
📧 Email: recruiter@architectureacademics.com
🔑 Password: Recruiter@123

✅ Found 8 existing blogs in database
✅ Found 10 existing discussions in database
✅ Found 1 existing jobs in database

INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

✅ **Backend is ready!** Visit http://localhost:8000/docs to see API documentation.

---

### Step 2: Frontend Setup (2 minutes)

Open a **new terminal window**:

```powershell
# Navigate to frontend
cd arch-client-web-1.0-main\arch-client-web-1.0-main

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

✅ **Frontend is ready!** Visit http://localhost:3000

---

## 🎉 You're All Set!

### Test the Application

1. **Open Browser**: Navigate to http://localhost:3000
2. **Click "Login"** in the top right
3. **Use Admin Credentials**:
   - Email: `admin@architectureacademics.com`
   - Password: `Admin@123`

### What You Can Do Now

#### As Admin:
- ✍️ Create blog posts at `/blogs/new`
- 💬 Start discussions at `/discussions/new`
- 📚 Browse sample courses at `/courses`
- 🎓 Check workshops at `/workshops`
- 📅 View events at `/events`
- 💼 See job postings at `/jobs-portal`

#### Sample Data Available:
- 8 blog posts across different categories
- 10 discussion topics with replies
- Sample courses and workshops
- Job postings from recruiters

---

## 🔐 Default Accounts

### Admin Account
```
Email: admin@architectureacademics.com
Password: Admin@123
Role: Full admin access
```

### Recruiter Account
```
Email: recruiter@architectureacademics.com
Password: Recruiter@123
Role: Can post jobs and view applications
```

### Test User
```
Email: john.doe@example.com
Password: Password123
Role: Regular user
```

---

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | API server |
| API Docs (Swagger) | http://localhost:8000/docs | Interactive API docs |
| API Docs (ReDoc) | http://localhost:8000/redoc | Alternative docs |

---

## 🛠️ Common Commands

### Backend Commands
```powershell
# Activate virtual environment
.\winvenv\Scripts\Activate.ps1

# Start server
python run_server.py

# Check Python version
python --version

# View installed packages
pip list
```

### Frontend Commands
```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Port 8000 already in use
```powershell
# Find and kill process
Get-Process -Name python | Stop-Process -Force
```

**Issue**: Module not found
```powershell
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

**Issue**: Database error
```powershell
# Delete and recreate database
Remove-Item architecture_academics.db
python run_server.py
```

### Frontend Issues

**Issue**: Module not found
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Issue**: Build errors
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

**Issue**: Port 3000 in use
```powershell
# Use different port
$env:PORT=3001; npm run dev
```

---

## 📚 Next Steps

### For Developers:
1. Read [Main README](README.md) for project overview
2. Check [Backend README](backend/README.md) for API details
3. Review [Frontend README](arch-client-web-1.0-main/arch-client-web-1.0-main/README.md) for UI development
4. See [Database Schema](DATABASE_SCHEMA.md) for database structure

### For Users:
1. Register a new account at `/register`
2. Explore blogs at `/blogs`
3. Join discussions at `/discussions`
4. Enroll in courses at `/courses`

---

## 🎨 Quick Feature Overview

### Blogs (`/blogs`)
- Medium-style blog platform
- Create, edit, and delete posts
- Comment and like functionality
- Category filters and search
- Featured blogs section

### Discussions (`/discussions`)
- Stack Overflow-style Q&A forum
- Ask questions and get answers
- Mark solutions
- Vote on replies
- Category-based organization

### Courses (`/courses`)
- Video-based learning
- Module structure
- Progress tracking
- Course reviews and ratings
- Enrollment system

### Workshops (`/workshops`)
- Hands-on training sessions
- Registration system
- Capacity management
- Instructor details

### Events (`/events`)
- Event listings
- RSVP functionality
- Event types: Conference, Workshop, Meetup, etc.

### Jobs Portal (`/jobs-portal`)
- Job postings by recruiters
- Application system
- Job filters (type, location)
- Recruiter dashboard

---

## 📞 Need Help?

### Documentation:
- [Main README](README.md) - Complete project documentation
- [Backend README](backend/README.md) - API and backend guide
- [Frontend README](arch-client-web-1.0-main/arch-client-web-1.0-main/README.md) - UI development guide
- [Database Schema](DATABASE_SCHEMA.md) - Database structure
- [Cleanup Summary](CLEANUP_SUMMARY.md) - Recent changes

### API Documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Common Tasks:
- **Create Blog**: Login → Navigate to `/blogs/new`
- **Ask Question**: Login → Navigate to `/discussions/new`
- **Post Job**: Login as Recruiter → Navigate to `/jobs-portal/post-job`
- **Enroll in Course**: Login → Browse `/courses` → Click "Enroll"

---

## ⚡ Pro Tips

1. **Keep Backend Running**: Always start backend before frontend
2. **Use Admin Account**: For testing all features without restrictions
3. **Check API Docs**: Visit `/docs` to understand all available endpoints
4. **Sample Data**: First run creates sample data automatically
5. **Dark Mode**: Use theme toggle for dark mode (if implemented)

---

## 🎊 Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access homepage
- [ ] Can login with admin account
- [ ] Can see blog posts
- [ ] Can see discussions
- [ ] API docs accessible at /docs

**All checked?** You're ready to go! 🚀

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Setup Time**: ~5 minutes
