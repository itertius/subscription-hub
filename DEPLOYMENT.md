# Deployment Guide

## GitHub Pages Deployment

### Prerequisites

1. Your repository must be public (or GitHub Pro/Team/Enterprise)
2. GitHub Pages must be enabled in repository settings

### Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Set Repository Name:**
   - Update the base path in `frontend/vite.config.js` if your repository name is different from `subscription-hub`
   - Or set `VITE_BASE_PATH` environment variable in GitHub Secrets

3. **Configure Backend API URL:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add a new secret named `VITE_API_URL`
   - Set the value to your backend API URL (e.g., `https://your-backend-api.com`)

4. **Deploy:**
   - Push to `main` or `master` branch
   - The GitHub Actions workflow will automatically build and deploy
   - Your site will be available at: `https://yourusername.github.io/subscription-hub/`

### Custom Domain

If you want to use a custom domain:

1. Add a `CNAME` file in the `frontend/public` directory with your domain
2. Update DNS settings to point to GitHub Pages
3. Update `VITE_BASE_PATH` to `/` in GitHub Secrets

## Docker Deployment

### Build and Run Locally

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Deploy to Cloud Platforms

#### Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect `docker-compose.yml`
3. Deploy both services

#### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Use the `docker-compose.yml` file
4. Set environment variables as needed

#### DigitalOcean App Platform

1. Create a new App
2. Connect your GitHub repository
3. Select Docker Compose configuration
4. Deploy

## Backend Deployment

### Option 1: Docker

```bash
# Build image
docker build -t subscription-hub-backend ./backend

# Run container
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/backend/db.json:/app/db.json \
  --name subscription-hub-backend \
  subscription-hub-backend
```

### Option 2: Node.js Direct

1. Install Node.js on your server
2. Clone the repository
3. Install dependencies: `cd backend && npm install`
4. Start the server: `npm start`
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name subscription-hub-backend
   pm2 save
   pm2 startup
   ```

### Environment Variables

For production, you may want to set:

- `NODE_ENV=production`
- `PORT=3001` (or your desired port)

## Frontend Deployment

### Option 1: Static Hosting (GitHub Pages, Netlify, Vercel)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Set `VITE_API_URL` environment variable to your backend URL

### Option 2: Docker with Nginx

```bash
# Build image
docker build -t subscription-hub-frontend ./frontend

# Run container
docker run -d \
  -p 80:80 \
  --name subscription-hub-frontend \
  subscription-hub-frontend
```

## CI/CD

The project includes GitHub Actions workflows:

1. **CI Pipeline** - Runs on every push/PR
   - Tests backend and frontend
   - Builds Docker images
   - Runs linting

2. **Deploy to GitHub Pages** - Runs on push to main/master
   - Builds frontend
   - Deploys to GitHub Pages

3. **Docker Publish** - Publishes Docker images to GitHub Container Registry

## Troubleshooting

### GitHub Pages 404 Errors

- Check that `base` path in `vite.config.js` matches your repository name
- Ensure all routes use relative paths
- Check browser console for errors

### API Connection Issues

- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible from frontend domain

### Docker Issues

- Check logs: `docker-compose logs`
- Verify ports are not in use
- Check Docker daemon is running

