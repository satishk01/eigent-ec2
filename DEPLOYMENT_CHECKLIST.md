# EC2 Deployment Checklist

## Current Status: Stuck on Permissions Screen

### Immediate Action Required

☐ **Access skip page:** http://3.218.250.170:5173/skip-onboarding.html  
☐ **Click "Skip Onboarding" button**  
☐ **You should be redirected to login page**

---

## Files to Copy to EC2

### Core Files (Required):
- ☐ `src/main.tsx`
- ☐ `src/utils/electronMock.ts`
- ☐ `src/utils/webOnlyConfig.ts` ⭐ NEW
- ☐ `vite.config.web.ts`
- ☐ `package.json`
- ☐ `public/skip-onboarding.html` ⭐ NEW

### Optional Files:
- ☐ `start-web.sh`
- ☐ `server.js`
- ☐ `nginx.conf`

---

## EC2 Configuration

### Security Group:
- ☐ Port 5173 allowed (Frontend)
- ☐ Port 8000 allowed (Backend - if applicable)
- ☐ Source: 0.0.0.0/0 or your IP

### Environment:
- ☐ Node.js installed (v18+)
- ☐ npm installed
- ☐ Git installed (optional)

---

## Deployment Steps

### 1. Copy Files
```bash
☐ cd /path/to/app
☐ git pull
   # OR
☐ scp -r src/ package.json vite.config.web.ts public/ ec2-user@3.218.250.170:/path/to/app/
```

### 2. Install Dependencies
```bash
☐ npm install
```

### 3. Start Backend (If Available)
```bash
☐ cd backend
☐ python main.py
   # OR
☐ uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Verify Backend
```bash
☐ curl http://localhost:8000/health
```

### 5. Start Frontend
```bash
☐ cd /path/to/app
☐ npm run dev:web
```

### 6. Verify Frontend
```bash
☐ curl http://localhost:5173/
☐ netstat -tulpn | grep 5173
```

---

## Testing

### URLs to Test:
- ☐ http://3.218.250.170:5173/ (base URL)
- ☐ http://3.218.250.170:5173/login (no #!)
- ☐ http://3.218.250.170:5173/history
- ☐ http://3.218.250.170:5173/skip-onboarding.html

### Browser Tests:
- ☐ Page loads without errors
- ☐ No # in URLs
- ☐ Can navigate between pages
- ☐ Refresh works on any page
- ☐ No errors in console (F12)

### API Tests (If Backend Running):
- ☐ API calls succeed
- ☐ No CORS errors
- ☐ Authentication works

---

## Troubleshooting Checklist

### If Stuck on Permissions:
- ☐ Access /skip-onboarding.html
- ☐ Clear localStorage in browser
- ☐ Check if backend is running
- ☐ Verify new files were copied

### If Nothing Loads:
- ☐ Security group allows port 5173
- ☐ App is running: `netstat -tulpn | grep 5173`
- ☐ Using `dev:web` not `dev`
- ☐ Check browser console for errors

### If API Calls Fail:
- ☐ Backend is running on port 8000
- ☐ VITE_PROXY_URL is configured
- ☐ Security group allows port 8000
- ☐ Check browser Network tab

### If URLs Have #:
- ☐ Using BrowserRouter (not HashRouter)
- ☐ Rebuilt app after changes
- ☐ Cleared browser cache
- ☐ Using correct npm script

---

## Production Deployment (Optional)

### Build:
- ☐ `npm run build:web`
- ☐ Verify dist/ folder created

### PM2 Setup:
- ☐ `npm install -g pm2`
- ☐ `pm2 serve dist 5173 --spa --name eigent-frontend`
- ☐ `pm2 save`
- ☐ `pm2 startup` (follow instructions)

### Nginx Setup (Optional):
- ☐ Install nginx
- ☐ Copy nginx.conf
- ☐ Test config: `sudo nginx -t`
- ☐ Start nginx: `sudo systemctl start nginx`

---

## Verification Commands

```bash
# Check running processes
☐ ps aux | grep node
☐ ps aux | grep python

# Check ports
☐ sudo netstat -tulpn | grep -E '5173|8000'

# Check PM2
☐ pm2 status
☐ pm2 logs

# Check logs
☐ tail -f /var/log/nginx/error.log  # if using nginx
```

---

## Success Criteria

✅ Can access http://3.218.250.170:5173/  
✅ Can access http://3.218.250.170:5173/login (no #)  
✅ No errors in browser console  
✅ Can navigate between pages  
✅ Page refresh works  
✅ API calls work (if backend running)  

---

## Quick Reference

### Start Commands:
```bash
# Frontend only
npm run dev:web

# With backend
cd backend && python main.py &
cd .. && npm run dev:web
```

### Stop Commands:
```bash
# Stop frontend (Ctrl+C)
# Or kill process:
kill -9 $(lsof -t -i:5173)

# Stop backend:
kill -9 $(lsof -t -i:8000)
```

### Restart Commands:
```bash
# PM2
pm2 restart eigent-frontend
pm2 restart eigent-backend

# Nginx
sudo systemctl restart nginx
```

---

## Support Files

- **IMMEDIATE_FIX.md** - Quick solutions for current issue
- **EC2_COMPLETE_SETUP.md** - Full setup with backend
- **EC2_WEB_DEPLOYMENT.md** - Web-only deployment guide
- **QUICK_FIX_SUMMARY.md** - Summary of all changes

---

## Notes

- ⭐ = New file added in latest update
- All routing issues fixed (no more #/login)
- Electron APIs mocked for web mode
- Onboarding auto-skips in web-only mode
- Backend optional but recommended for full functionality
