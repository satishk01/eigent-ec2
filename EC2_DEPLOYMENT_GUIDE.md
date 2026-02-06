# EC2 Deployment Guide - Routing Fix

## Changes Made

The application has been updated from HashRouter to BrowserRouter to fix the `#/login` routing issue.

### Modified Files:
1. **src/main.tsx** - Changed from `HashRouter` to `BrowserRouter`

### New Files Created:
1. **nginx.conf** - Nginx configuration for proper routing
2. **public/_redirects** - Fallback redirect configuration

## Deployment Steps

### Option 1: Using Nginx (Recommended)

1. **Build your React application:**
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Copy the build files to your EC2 instance:**
   ```bash
   scp -r dist/* ec2-user@your-ec2-ip:/usr/share/nginx/html/
   ```

3. **Copy the nginx configuration:**
   ```bash
   scp nginx.conf ec2-user@your-ec2-ip:/etc/nginx/conf.d/react-app.conf
   ```

4. **On your EC2 instance, restart nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Option 2: Using Node.js with Express

If you're serving with Node.js, create a simple server:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Then run:
```bash
node server.js
```

### Option 3: Using PM2 with Serve

```bash
npm install -g serve pm2
pm2 serve dist 3000 --spa
pm2 save
pm2 startup
```

## Verification

After deployment, test these URLs:
- `http://your-ec2-ip/` - Should work
- `http://your-ec2-ip/login` - Should work (no more #/login)
- `http://your-ec2-ip/history` - Should work
- Refresh on any page - Should not show 404

## Troubleshooting

### Issue: 404 on page refresh
**Solution:** Ensure your web server is configured to redirect all requests to index.html

### Issue: API calls failing
**Solution:** Check the proxy configuration in nginx.conf and update the backend URL

### Issue: Assets not loading
**Solution:** Verify the base path in vite.config.ts and ensure static files are served correctly

## Files to Copy to EC2

Copy these files/folders to your EC2 instance:
- `dist/` folder (after running build)
- `nginx.conf` (if using nginx)
- `server.js` (if using Node.js/Express)

## Important Notes

- The application now uses clean URLs without the `#` symbol
- All routes will work correctly with direct access and page refresh
- Make sure your web server is configured to handle client-side routing
- Update any bookmarks or saved links that used the old `#/login` format
