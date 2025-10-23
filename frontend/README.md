# Architecture Academics Frontend# UI redesign



Modern, responsive Next.js frontend for the Architecture Academics platform with beautiful UI components and seamless API integration.*Automatically synced with your [v0.app](https://v0.app) deployments*



## 🎨 Features[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sujitlaware1809s-projects/v0-ui-redesign)

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Bjnh6sfhPWG)

### User Interface

- **Modern Design**: Clean, professional UI with Tailwind CSS## Overview

- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile

- **Dark Mode**: Theme provider with dark mode supportThis repository will stay in sync with your deployed chats on [v0.app](https://v0.app).

- **Smooth Animations**: Framer Motion animations and transitionsAny changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

- **Accessible**: WCAG-compliant components

- **Fast Loading**: Optimized images and lazy loading## Deployment



### Page FeaturesYour project is live at:

- **Homepage**: Hero section with featured content and quick navigation

- **Blogs**: Medium-style blog platform with search, filters, and reading time**[https://vercel.com/sujitlaware1809s-projects/v0-ui-redesign](https://vercel.com/sujitlaware1809s-projects/v0-ui-redesign)**

- **Discussions**: Stack Overflow-style Q&A forum with categories and voting

- **Courses**: Course catalog with enrollment and progress tracking## Build your app

- **Workshops**: Workshop listings with registration

- **Events**: Event calendar with RSVP functionalityContinue building your app on:

- **Jobs Portal**: Job listings and application system

- **User Profile**: Customizable profiles with activity tracking**[https://v0.app/chat/projects/Bjnh6sfhPWG](https://v0.app/chat/projects/Bjnh6sfhPWG)**

- **Admin Dashboard**: Content management and analytics

## How It Works

## 🛠️ Tech Stack

1. Create and modify your project using [v0.app](https://v0.app)

- **Framework**: Next.js 15.2.4 (App Router)2. Deploy your chats from the v0 interface

- **Language**: TypeScript 53. Changes are automatically pushed to this repository

- **Styling**: Tailwind CSS 3.44. Vercel deploys the latest version from this repository

- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks & Context API
- **HTTP Client**: Custom Fetch API wrapper
- **Authentication**: JWT tokens with localStorage
- **Video Player**: Custom video player component
- **Forms**: React Hook Form (recommended)

## 📦 Prerequisites

- **Node.js**: >= 18.0.0
- **npm** or **pnpm**: Latest version
- **Backend API**: Running on `http://localhost:8000`

## 🚀 Installation

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd arch-client-web-1.0-main/arch-client-web-1.0-main

# Install using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

### 3. Run Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
arch-client-web-1.0-main/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── loading.tsx              # Global loading component
│   ├── globals.css              # Global styles
│   │
│   ├── blogs/                   # Blog pages
│   │   ├── page.tsx            # Blog listing (Medium-style)
│   │   ├── new/                # Create blog
│   │   │   └── page.tsx
│   │   └── [slug]/             # Blog detail
│   │       └── page.tsx
│   │
│   ├── discussions/             # Discussion forum pages
│   │   ├── page.tsx            # Discussion listing (forum-style)
│   │   ├── new/                # Create discussion
│   │   │   └── page.tsx
│   │   └── [id]/               # Discussion detail
│   │       └── page.tsx
│   │
│   ├── courses/                 # Course pages
│   │   ├── page.tsx            # Course catalog
│   │   └── [id]/               # Course detail
│   │       └── page.tsx
│   │
│   ├── workshops/               # Workshop pages
│   │   ├── page.tsx            # Workshop listings
│   │   └── [id]/               # Workshop detail
│   │       └── page.tsx
│   │
│   ├── events/                  # Event pages
│   │   ├── page.tsx            # Event listings
│   │   └── [id]/               # Event detail
│   │       └── page.tsx
│   │
│   ├── jobs-portal/             # Job portal pages
│   │   ├── page.tsx            # Job listings
│   │   ├── [id]/               # Job detail
│   │   │   └── page.tsx
│   │   └── post-job/           # Post job (recruiter)
│   │       └── page.tsx
│   │
│   ├── profile/                 # User profile
│   │   └── page.tsx            # Profile page
│   │
│   ├── login/                   # Authentication
│   │   └── page.tsx            # Login page
│   │
│   ├── register/                # Registration
│   │   └── page.tsx            # Register page
│   │
│   ├── admin/                   # Admin dashboard
│   │   └── page.tsx            # Admin panel
│   │
│   └── recruiter-dashboard/     # Recruiter dashboard
│       └── page.tsx            # Dashboard for recruiters
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   └── ...
│   │
│   ├── theme-provider.tsx       # Dark mode provider
│   ├── video-player.tsx         # Custom video player
│   │
│   ├── events/                  # Event components
│   │   ├── event-card.tsx
│   │   └── event-filters.tsx
│   │
│   └── workshops/               # Workshop components
│       ├── workshop-card.tsx
│       └── workshop-registration.tsx
│
├── lib/                          # Utilities and helpers
│   ├── api.ts                   # API client with HTTP methods
│   ├── utils.ts                 # Utility functions
│   └── data/                    # Static data and constants
│
├── public/                       # Static assets
│   ├── placeholder-logo.png
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── AWS.mp4
│
├── styles/                       # Additional styles
│   └── ...
│
├── components.json               # shadcn/ui configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.mjs           # PostCSS configuration
├── package.json                 # Dependencies and scripts
└── .env.local                   # Environment variables
```

## 🔑 Key Files Explained

### `lib/api.ts`
API client with authentication and HTTP methods:
```typescript
// Usage examples
import * as api from '@/lib/api';

// Authentication
await api.login(email, password);
await api.register(userData);
api.logout();

// Get requests
const blogs = await api.get('/blogs');
const user = await api.getStoredUser();

// Post requests
await api.post('/blogs', blogData);

// Put requests
await api.put(`/blogs/${id}`, updatedData);

// Delete requests
await api.delete(`/blogs/${id}`);
```

### `app/layout.tsx`
Root layout with theme provider and global styles.

### `components/ui/`
Reusable UI components from shadcn/ui. Add new components using:
```bash
npx shadcn@latest add <component-name>
```

## 🎨 Styling Guide

### Tailwind CSS Classes

**Common Patterns:**
```tsx
// Card
<Card className="p-6 hover:shadow-lg transition-shadow">

// Button (Primary)
<Button className="bg-purple-600 hover:bg-purple-700">

// Badge
<Badge variant="secondary" className="bg-purple-100 text-purple-800">

// Input
<Input className="border-gray-300 focus:ring-purple-500">

// Gradient Background
<div className="bg-gradient-to-r from-purple-600 to-indigo-600">
```

### Design System

**Colors:**
- Primary: `purple-600` / `#9333EA`
- Secondary: `indigo-600` / `#4F46E5`
- Success: `green-600` / `#16A34A`
- Error: `red-600` / `#DC2626`
- Warning: `yellow-600` / `#CA8A04`
- Info: `blue-600` / `#2563EB`

**Typography:**
- Headings: `font-bold text-3xl`, `text-2xl`, `text-xl`
- Body: `text-base text-gray-700 dark:text-gray-300`
- Small: `text-sm text-gray-600`

**Spacing:**
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section: `py-12 md:py-16 lg:py-20`
- Card padding: `p-6`

## 📱 Responsive Design

All pages are responsive with breakpoints:
- **Mobile**: `< 640px` (default)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)

Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🔐 Authentication Flow

### Login
1. User enters credentials on `/login`
2. API call to `/login` endpoint
3. Store JWT token and user data in localStorage
4. Redirect to dashboard or previous page

### Protected Routes
```typescript
// Check authentication
if (!api.isAuthenticated()) {
  router.push('/login');
  return;
}

// Get current user
const user = api.getStoredUser();
```

### Logout
```typescript
api.logout(); // Clears localStorage
router.push('/login');
```

## 🧩 Component Examples

### Blog Card
```tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

<Card className="p-6 hover:shadow-lg transition-shadow">
  <Badge className="mb-2">{category}</Badge>
  <h3 className="text-xl font-bold mb-2">{title}</h3>
  <p className="text-gray-600 mb-4">{excerpt}</p>
  <div className="flex items-center gap-4 text-sm text-gray-500">
    <div className="flex items-center gap-1">
      <User className="h-4 w-4" />
      <span>{author}</span>
    </div>
    <div className="flex items-center gap-1">
      <Clock className="h-4 w-4" />
      <span>{readingTime} min read</span>
    </div>
  </div>
</Card>
```

### Loading State
```tsx
import { Loader2 } from 'lucide-react';

{loading && (
  <div className="flex justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
  </div>
)}
```

## 🚀 Building for Production

### Build the Application
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
Update `.env.local` or use Vercel environment variables:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 📊 Performance Optimization

### Image Optimization
Use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/placeholder.jpg"
  alt="Description"
  width={800}
  height={600}
  className="rounded-lg"
  priority // For above-the-fold images
/>
```

### Code Splitting
Dynamic imports for heavy components:
```tsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <p>Loading player...</p>,
  ssr: false
});
```

### Lazy Loading
```tsx
'use client';
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test User Accounts
Use these credentials for testing:
- **Admin**: `admin@architectureacademics.com` / `Admin@123`
- **Recruiter**: `recruiter@architectureacademics.com` / `Recruiter@123`
- **User**: `john.doe@example.com` / `Password123`

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues
1. Check if backend is running on `http://localhost:8000`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Ensure backend CORS allows `http://localhost:3000`

### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Generate type definitions
npm run build
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run dev

# Check PostCSS configuration
# Verify tailwind.config.js includes all content paths
```

## 🔄 Adding New Pages

### 1. Create Page File
```bash
# Example: Add a new features page
mkdir -p app/features
touch app/features/page.tsx
```

### 2. Add Page Content
```tsx
// app/features/page.tsx
export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Features</h1>
      {/* Your content */}
    </div>
  );
}
```

### 3. Add Navigation Link
Update navigation in `app/layout.tsx` or your header component.

## 🎨 Adding shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add dialog

# Add multiple components
npx shadcn@latest add dialog dropdown-menu tabs
```

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful component names
- Add JSDoc comments for complex functions

### Component Guidelines
- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks
- Follow React best practices

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request

## 📄 Scripts

```json
{
  "dev": "next dev",              // Development server
  "build": "next build",          // Production build
  "start": "next start",          // Production server
  "lint": "next lint",            // Run ESLint
  "type-check": "tsc --noEmit"   // Check TypeScript
}
```

## 🔗 Related Documentation

- [Main README](../../README.md) - Project overview
- [Backend README](../../backend/README.md) - API documentation

---

**Last Updated**: January 2025
**Version**: 1.0.0
