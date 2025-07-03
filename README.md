# EduDriveHub Frontend

Pure HTML/CSS/JavaScript frontend for the EduDriveHub educational platform.

## Features

- **Clean Design**: Modern, responsive interface using pure CSS
- **Two Subjects**: MS-CIT (free) and KLiC Hardware (premium)
- **Admin Access**: Secure admin panel for content management
- **Password Protection**: Premium subjects require password authentication
- **Chapter Viewing**: PDF viewing and download functionality

## Project Structure

```
edudrivehub-frontend/
├── index.html          # Main homepage
├── admin.html          # Admin dashboard
├── style.css           # All styling
├── script.js           # Homepage functionality
├── admin.js            # Admin panel functionality
├── package.json        # Project configuration
└── README.md           # This file
```

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

This will start a local server at `http://localhost:3000`

### Manual Setup

You can also serve the files using any static server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js http-server globally
npx http-server . -p 3000 -o
```

## Usage

### For Students

1. Visit the homepage
2. Browse available subjects:
   - **MS-CIT**: Free access, click "View Content"
   - **KLiC Hardware**: Premium access, requires password

### For Admins

1. Click "Admin Login" button
2. Use credentials:
   - **Username**: `admin_eduhub`
   - **Password**: `EduDrive@2025#Secure`
3. Manage subjects and upload chapters

### Subject Access

- **MS-CIT**: No password required
- **KLiC Hardware**: Password is `Klic@Hardware2025#Edu!`

## API Integration

The frontend communicates with the backend API at:
- Development: `http://localhost:5000`
- Production: Your deployed backend URL

Update the `API_BASE_URL` in `script.js` and `admin.js` for production deployment.

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `.` (root)
4. Deploy

### Manual Deployment

1. Upload all files to your hosting provider
2. Ensure `index.html` is set as the default page
3. Update API endpoints in JavaScript files

## Environment Variables

For production, update these values in the JavaScript files:

- `API_BASE_URL`: Backend API URL
- Ensure CORS is configured on the backend

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details