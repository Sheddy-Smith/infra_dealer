# Admin Panel Setup Guide

## Overview
The InfraDealer admin panel is a separate React application that connects to the same backend API as the main application. This allows independent deployment and hosting on different domains/subdomains.

## Architecture
- **Main App**: React app on port 3000 → Backend API (port 5000)
- **Admin Panel**: React app on port 3001 → Backend API (port 5000)
- **Backend**: Shared Express API with SQLite database

## Quick Start

### 1. Install Dependencies
```powershell
cd admin-panel
npm install
```

### 2. Configure Environment
Create `.env` file in `admin-panel` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

For production:
```env
VITE_API_URL=https://api.infradealer.com/api
```

### 3. Create Admin User
Run this command from the `api` folder:
```powershell
cd ..\api
node createAdmin.js
```

This creates an admin user with:
- Phone: `9999999999`
- Role: `admin`
- Password: (same as other users in your database)

### 4. Start Development Server
```powershell
cd ..\admin-panel
npm run dev
```

Admin panel will run on: `http://localhost:3001`

### 5. Login
1. Open `http://localhost:3001/login`
2. Enter phone: `9999999999`
3. Enter password
4. Access admin dashboard

## Backend Setup (Already Configured)

The backend has been updated with:

✅ Admin login route: `POST /api/admin/login`
✅ Admin verification: `GET /api/admin/verify`
✅ Dashboard charts: `GET /api/admin/dashboard/charts`
✅ All listings: `GET /api/admin/listings`
✅ KYC management: `/api/admin/kyc/*`
✅ Broker management: `GET /api/admin/brokers`
✅ Audit logs: `GET /api/admin/audit`
✅ CORS configured for `http://localhost:3001`

## Deployment Options

### Option 1: Vercel (Recommended for React Apps)

1. **Install Vercel CLI**:
```powershell
npm install -g vercel
```

2. **Deploy**:
```powershell
cd admin-panel
vercel
```

3. **Set Environment Variable** in Vercel dashboard:
   - `VITE_API_URL` = `https://api.infradealer.com/api`

4. **Custom Domain** (optional):
   - Add `admin.infradealer.com` in Vercel domains

### Option 2: Netlify

1. **Build the app**:
```powershell
npm run build
```

2. **Deploy** via Netlify CLI or drag & drop `dist` folder to netlify.com

3. **Set Environment Variable**:
   - `VITE_API_URL` = `https://api.infradealer.com/api`

4. **Add `_redirects` file** in `public` folder:
```
/* /index.html 200
```

### Option 3: Traditional VPS (Apache/Nginx)

#### Build the app:
```powershell
npm run build
```

#### Apache Configuration:
```apache
<VirtualHost *:80>
    ServerName admin.infradealer.com
    DocumentRoot /var/www/admin-panel/dist
    
    <Directory /var/www/admin-panel/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name admin.infradealer.com;
    root /var/www/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

## Backend CORS Configuration

Update `api/server.js` to allow your admin panel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',      // Main app (dev)
    'http://localhost:3001',      // Admin panel (dev)
    'https://infradealer.com',    // Main app (prod)
    'https://admin.infradealer.com' // Admin panel (prod)
  ],
  credentials: true
}));
```

## Features

### Dashboard
- 📊 Real-time statistics (listings, users, brokers, tokens)
- 📈 Interactive charts (daily users, listings by category, revenue)
- 🎯 Quick access to pending approvals

### Listings Management
- ✅ Approve/reject pending listings
- 🗑️ Delete inappropriate listings
- 🔍 Search and filter by status/category
- 👀 View all listing details

### KYC Management
- ✅ Approve broker KYC applications
- ❌ Reject with reasons
- 🏅 Assign badges (verified_broker, premium_broker)
- 📋 View all brokers and their status

### User Management
- 👥 View all users (buyers, sellers, brokers)
- 🔒 Suspend/activate user accounts
- 💰 Add bonus tokens
- 📞 Contact information management

### Reports & Transactions
- 📝 User reports and complaints
- 💳 Token transaction history
- 🔍 Audit trail of admin actions
- 📢 System announcements

## Security Notes

### Authentication
- Separate token storage (`admin_token` vs `token`)
- Role verification on every API call
- JWT token with 7-day expiry

### Best Practices
1. **Use HTTPS** in production
2. **Set strong admin passwords**
3. **Restrict admin panel domain** at firewall level
4. **Enable rate limiting** on login endpoint
5. **Monitor audit logs** regularly
6. **Keep dependencies updated**

## Troubleshooting

### "Cannot connect to API"
- Check if backend is running on port 5000
- Verify `VITE_API_URL` in `.env` file
- Check CORS configuration in backend

### "Unauthorized" error
- Ensure user has `role='admin'` in database
- Check if JWT token is valid
- Verify backend admin middleware

### "Network Error"
- Check if backend CORS allows admin panel origin
- Ensure API URL is correct (no trailing slash)
- Check browser console for detailed errors

### Charts not showing
- Ensure Recharts is installed: `npm install recharts`
- Check API response format in Network tab
- Verify dashboard API endpoint returns correct data

## File Structure

```
admin-panel/
├── public/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx       # Sidebar layout
│   ├── contexts/
│   │   └── AdminAuthContext.jsx  # Auth management
│   ├── pages/
│   │   ├── AdminLogin.jsx        # Login page
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Listings.jsx          # Listings management
│   │   ├── KYC.jsx               # KYC approvals
│   │   ├── Users.jsx             # User management
│   │   ├── Reports.jsx           # Reports
│   │   ├── Transactions.jsx      # Transactions
│   │   ├── Audit.jsx             # Audit logs
│   │   └── Announcements.jsx     # Announcements
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── config/
│   │   └── api.js                # API base URL config
│   ├── App.jsx                   # Main app & routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
├── .env.example                  # Template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Development Workflow

### Adding New Features

1. **Create new page component** in `src/pages/`
2. **Add route** in `src/App.jsx`
3. **Add API method** in `src/services/api.js` (if needed)
4. **Add backend route** in `api/routes/admin.js` (if needed)
5. **Update sidebar menu** in `src/components/AdminLayout.jsx`

### Example: Adding "Settings" page

```jsx
// 1. Create src/pages/Settings.jsx
const Settings = () => {
  return <div>Settings content</div>
}
export default Settings

// 2. Add route in src/App.jsx
import Settings from './pages/Settings'
<Route path="/settings" element={<Settings />} />

// 3. Add menu item in src/components/AdminLayout.jsx
{ icon: Settings, label: 'Settings', path: '/settings' }
```

## Support

For issues or questions:
1. Check this README first
2. Review browser console errors
3. Check backend logs
4. Verify API responses in Network tab

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete admin panel separation
- ✅ Dashboard with charts
- ✅ Listings management
- ✅ KYC approvals
- ✅ User management
- ✅ Environment-based API configuration
- ✅ Responsive design
- ✅ Security features (role-based access)
- ✅ Deployment guides for Vercel/Netlify/VPS
