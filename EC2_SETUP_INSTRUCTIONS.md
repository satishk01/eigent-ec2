# EC2 Setup Instructions - Complete Guide

## Problem Solved
1. Changed from HashRouter to BrowserRouter (fixes `#/login` issue)
2. Configured Vite to listen on `0.0.0.0` (fixes EC2 external access)

## Files Modified
1. **src/main.tsx** - Changed to BrowserRouter
2. **vite.config.ts** - Added `host: '0.0.0.0'` and `port: 5173`

## EC2 Security Group Configuration

**IMPORTANT:** Before accessing your app, ensure your EC2 security group allows inbound traffic:

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rule:
   - Type: Custom TCP
   - Port: 5173
   - Source: 0.0.0.0/0 (or your IP for security)

## Running on EC2

### Option 1: Development Server (Quick Test)

On your EC2 instance:

```bash
# Install dependencies (if not already done)
npm install

# Run the dev server
npm run dev
```

The server will now be accessible at: `http://YOUR_EC2_IP:5173`

### Option 2: Production Build (Recommended)

**Step 1: Build locally or on EC2**
```bash
npm run build
```

**Step 2: Serve the production build**

Choose one method:

**A. Using serve (simplest):**
```bash
npm install -g serve
serve -s dist -l 5173
```

**B. Using the provided server.js:**
```bash
npm install express
node server.js
```

**C. Using PM2 (best for production):**
```bash
npm install -g pm2
pm2 serve dist 5173 --spa --name eigent-app
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

**D. Using Nginx (most robust):**
```bash
# Install nginx
sudo yum install nginx -y  # Amazon Linux
# or
sudo apt install nginx -y  # Ubuntu

# Copy your build
sudo cp -r dist/* /usr/share/nginx/html/

# Copy nginx config
sudo cp nginx.conf /etc/nginx/conf.d/eigent.conf

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Troubleshooting

### Issue: "Connection refused" or timeout
**Solutions:**
1. Check EC2 security group allows port 5173
2. Verify the app is running: `netstat -tulpn | grep 5173`
3. Check if firewall is blocking: `sudo iptables -L`

### Issue: Can access base URL but not /login
**Solution:** This is fixed by the BrowserRouter change. If still happening:
- Ensure you rebuilt the app after the changes
- Clear browser cache
- Check server logs for errors

### Issue: API calls failing
**Solution:** 
- Check if backend is running
- Verify API proxy configuration in vite.config.ts
- Check backend URL in environment variables

### Issue: Blank page
**Solutions:**
1. Check browser console for errors (F12)
2. Verify all files in dist folder were copied
3. Check file permissions: `chmod -R 755 dist/`

## Environment Variables

Create a `.env.production` file if needed:

```env
VITE_API_URL=http://YOUR_BACKEND_URL
VITE_USE_LOCAL_PROXY=false
```

## Testing Your Deployment

After starting the server, test these URLs:

```bash
# Base URL
curl http://YOUR_EC2_IP:5173/

# Login page (should return HTML, not 404)
curl http://YOUR_EC2_IP:5173/login

# History page
curl http://YOUR_EC2_IP:5173/history
```

All should return the same HTML content (index.html).

## Production Checklist

- [ ] Security group allows port 5173 (or 80/443 for nginx)
- [ ] App built with `npm run build`
- [ ] Server configured to listen on 0.0.0.0
- [ ] All routes redirect to index.html
- [ ] Environment variables set correctly
- [ ] Backend API accessible
- [ ] SSL certificate configured (if using HTTPS)
- [ ] Process manager (PM2) configured for auto-restart

## Quick Commands Reference

```bash
# Check if port is open
sudo netstat -tulpn | grep 5173

# Check running processes
ps aux | grep node

# View logs (if using PM2)
pm2 logs eigent-app

# Restart app (PM2)
pm2 restart eigent-app

# Stop app (PM2)
pm2 stop eigent-app

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Port 80 Setup (Optional)

To run on standard HTTP port 80:

**Using nginx:** Already configured in nginx.conf

**Using Node.js directly:**
```bash
# Requires root or sudo
sudo PORT=80 node server.js
```

**Using PM2:**
```bash
sudo pm2 serve dist 80 --spa --name eigent-app
```

## Next Steps

1. Copy modified files to EC2
2. Rebuild the application
3. Configure security group
4. Start the server
5. Access http://YOUR_EC2_IP:5173
6. Test all routes work without `#`
