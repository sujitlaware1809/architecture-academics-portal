# Architecture Academics Frontend

## Prerequisites

- **Node.js**: >= 18.0.0
- **npm** or **pnpm**: Latest version
- **Backend API**: Running on `http://localhost:8000`

## Installation

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
