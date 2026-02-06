# Quick Deployment Summary

## Problems Fixed
1. Changed from HashRouter to BrowserRouter to eliminate the `#/login` URL issue
2. **Added `host: '0.0.0.0'` to vite.config.ts so EC2 can accept external connections**

## Files Changed
1. **src/main.tsx** - Changed `HashRouter` to `BrowserRouter`
2. **vite.config.ts** - Added `host: '0.0.0.0'` and `port: 5173` to server config

## CRITICAL: EC2 Security Group

**You MUST allow port 5173 in your EC2 security group:**
1. AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 5173
   - Source: 0.0.0.0/0 (or your IP)

## Quick Deploy Steps

### On EC2 - Run Development Server:
```bash
npm install
npm run dev
```
Access at: `http://3.218.250.170:5173/`

### OR - Production Build:
```bash
# Build
npm run build

# Serve with PM2 (recommended)
npm install -g pm2
pm2 serve dist 5173 --spa --name eigent-app
pm2 save
```

### OR - Using provided server.js:
```bash
npm install express
node server.js
```

## Test URLs
After deployment, all these should work:
- http://3.218.250.170:5173/
- http://3.218.250.170:5173/login (no more #)
- http://3.218.250.170:5173/history
- http://3.218.250.170:5173/signup

## Troubleshooting

**Nothing loads?**
1. Check security group allows port 5173
2. Verify app is running: `netstat -tulpn | grep 5173`
3. Check browser console (F12) for errors

**Still see #/login?**
- Rebuild the app after changes: `npm run build`
- Clear browser cache

## Key Changes Summary
- Router: HashRouter → BrowserRouter (clean URLs)
- Server: Now listens on 0.0.0.0:5173 (accepts external traffic)
- Security: Must allow port 5173 in EC2 security group
