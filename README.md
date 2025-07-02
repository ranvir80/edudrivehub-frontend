# EduDriveHub Frontend

React frontend for Nakshatra Infotech EduDriveHub - Educational Document Management System.

## Deployment to Vercel

### 1. Import Project
- Go to Vercel dashboard
- Click "New Project"
- Import this repository
- Use these settings:
  - **Framework Preset**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### 2. Environment Variables
Add this in Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-render-backend.onrender.com
```

### 3. Test Deployment
After deployment:
- Visit your Vercel URL
- Test student access to both subjects
- Test admin login: admin@nakshatra.com / admin123
- Verify file uploads work

## Features
- **Student Dashboard**: Browse MSCIT (open) and KLiC Hardware (premium)
- **Password Protection**: Premium subjects require password "klic2024"
- **Admin Panel**: Upload and manage PDF chapters
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Automatic theme switching

## Default Credentials
- **Admin**: admin@nakshatra.com / admin123
- **KLiC Hardware Password**: klic2024

## Tech Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Shadcn/ui
- TanStack Query for API calls
- Wouter for routing