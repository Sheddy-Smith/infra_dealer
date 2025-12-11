# InfraDealer Admin Panel

Alag deployable admin panel for InfraDealer platform. Same backend API use karta hai, bas frontend alag host pe deploy hota hai.

## Features

✅ **Separate Deployment** - Admin panel ko independently deploy karo  
✅ **Same Backend** - Main InfraDealer backend API se connect hota hai  
✅ **Role-Based Access** - Sirf admin role wale users access kar sakte hain  
✅ **Complete Admin Features** - Dashboard, Listings, KYC, Users, Reports, etc.  
✅ **Secure Authentication** - Token-based auth with admin verification  

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Environment Configuration

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your backend URL:

```env
# Local Development
VITE_API_URL=http://localhost:5000/api

# Production
VITE_API_URL=https://your-backend-domain.com/api
```

### 3. Development

```bash
npm run dev
```

Admin panel will run on: `http://localhost:3001`

### 4. Production Build

```bash
npm run build
```

Build files will be in `dist/` folder.

## Deployment Options

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd admin-panel
vercel --prod
```

Environment Variables (Vercel Dashboard):
- `VITE_API_URL` = Your backend API URL

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Environment Variables (Netlify Dashboard):
- `VITE_API_URL` = Your backend API URL

### Option 3: Traditional Server (Apache/Nginx)

1. Build the project:
```bash
npm run build
```

2. Upload `dist/` folder contents to your server

3. Nginx Configuration:
```nginx
server {
    listen 80;
    server_name admin.infradealer.com;

    root /var/www/admin-panel;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Add SSL
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

4. Apache Configuration (.htaccess):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Backend Integration

Admin panel automatically connects to your main backend. Make sure these routes exist:

### Required Admin API Routes:

```
POST   /api/admin/login          - Admin login
GET    /api/admin/verify         - Verify admin token
GET    /api/admin/dashboard/stats - Dashboard statistics
GET    /api/admin/dashboard/charts - Chart data
GET    /api/admin/listings       - All listings
POST   /api/admin/listings/:id/approve - Approve listing
POST   /api/admin/listings/:id/reject  - Reject listing
GET    /api/admin/kyc/pending    - Pending KYC applications
POST   /api/admin/kyc/:id/approve - Approve KYC
POST   /api/admin/kyc/:id/reject  - Reject KYC
GET    /api/admin/users          - All users
GET    /api/admin/reports        - Reports & complaints
GET    /api/admin/transactions   - Transaction logs
GET    /api/admin/audit          - Audit trail
```

## Admin Login Credentials

Default admin user should be created in your backend database:

```sql
-- Create admin user
INSERT INTO users (phone, name, role, password) 
VALUES ('9999999999', 'Admin', 'admin', 'hashed_password');
```

## Security Notes

1. **HTTPS Required** - Always use HTTPS in production
2. **CORS Configuration** - Backend should allow admin panel domain
3. **Token Security** - Admin tokens stored in localStorage with prefix `admin_token`
4. **Role Verification** - Backend must verify `role = 'admin'` for all admin routes
5. **Rate Limiting** - Implement rate limiting on admin routes

## Tech Stack

- **React 18** - Frontend framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Charts & analytics
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Vite** - Build tool

## Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx      # Main layout with sidebar
│   ├── contexts/
│   │   └── AdminAuthContext.jsx # Auth state management
│   ├── pages/
│   │   ├── AdminLogin.jsx       # Login page
│   │   ├── Dashboard.jsx        # Dashboard with stats
│   │   └── [other pages]        # Placeholder pages
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── config/
│   │   └── api.js               # API configuration
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                       # Static assets
├── dist/                         # Production build (generated)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                          # Environment variables
```

## Troubleshooting

### CORS Errors

Add admin panel URL to backend CORS configuration:

```javascript
// Backend server.js
app.use(cors({
  origin: [
    'http://localhost:3000',      // Main frontend
    'http://localhost:3001',      // Admin panel
    'https://infradealer.com',    // Production frontend
    'https://admin.infradealer.com' // Production admin
  ],
  credentials: true
}))
```

### 404 on Refresh

Single Page Application (SPA) needs server configuration to redirect all routes to `index.html`. See deployment configurations above.

### Authentication Issues

1. Check if admin user has `role = 'admin'` in database
2. Verify backend `/admin/verify` route is working
3. Check if token is being sent in Authorization header
4. Clear localStorage and try again

## Support

For issues or questions:
- Check main InfraDealer backend logs
- Verify API endpoints are accessible
- Check browser console for errors
- Ensure environment variables are set correctly

---

**Note:** Admin panel aur main frontend dono same backend use karte hain. Database, API, sab shared hai - sirf UI alag deploy hota hai.
