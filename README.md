# Subscription Hub

A modern web application to manage and track your subscription payments in one place. Built with React and Node.js.

## Features

- 📦 **Subscription Management**: Add, edit, and delete subscriptions
- 💳 **Payment Tracking**: Record and track payment history
- 📊 **Dashboard**: View statistics and insights about your subscriptions
- 🔍 **Filtering**: Filter subscriptions by status and category
- 📅 **Upcoming Payments**: See upcoming billing dates
- 🏷️ **Categories**: Organize subscriptions by category
- 💰 **Multiple Currencies**: Support for USD, EUR, GBP, JPY, CAD, AUD, THB
- 🎨 **Modern UI**: Beautiful, responsive design

## Tech Stack

### Backend
- Node.js with Express.js
- LowDB (JSON file-based database)
- RESTful API

### Frontend
- React 18
- Vite
- Axios for API calls
- date-fns for date formatting

## Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
./start.sh
```

This will:
- Start the backend server on http://localhost:3001
- Start the frontend dev server on http://localhost:3000
- Open your browser automatically

### Option 2: Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3001

### Option 3: Manual Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start backend:**
   ```bash
   npm run start:backend
   ```

3. **Start frontend (in another terminal):**
   ```bash
   npm run start:frontend
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Docker

### Build Images

```bash
docker-compose build
```

### Run Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f
```

### Stop Services

```bash
docker-compose down
```

## CI/CD

### GitHub Actions

The project includes GitHub Actions workflows for:

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Tests backend and frontend
   - Builds Docker images
   - Runs linting

2. **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`):
   - Builds frontend for production
   - Deploys to GitHub Pages

3. **Docker Publish** (`.github/workflows/docker-publish.yml`):
   - Builds and publishes Docker images to GitHub Container Registry

### Setting up GitHub Pages

1. Go to your repository Settings → Pages
2. Set source to "GitHub Actions"
3. The frontend will be deployed automatically on push to main/master branch

### Environment Variables

For GitHub Pages deployment, set the following secret in your repository:
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-api.com`)

## API Endpoints

### Subscriptions

- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/subscriptions/stats/summary` - Get subscription statistics

### Payments

- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment record
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

## Database

The application uses LowDB, a JSON file-based database. The database file is stored at:
- `backend/db.json`

**Note**: Make sure to backup this file regularly!

## Project Structure

```
subscription-hub/
├── backend/
│   ├── routes/
│   │   ├── subscriptions.js
│   │   └── payments.js
│   ├── database.js
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── docker-publish.yml
├── docker-compose.yml
├── start.sh
└── README.md
```

## Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-reload on file changes
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

## Production Deployment

### Using Docker

1. Build images:
   ```bash
   docker-compose build
   ```

2. Start services:
   ```bash
   docker-compose up -d
   ```

### Using GitHub Pages

The frontend is automatically deployed to GitHub Pages when you push to the main branch.

### Backend Deployment

For production backend deployment, you can:
- Use Docker and deploy to any container platform
- Deploy to services like Railway, Render, Heroku, etc.
- Use the Docker image from GitHub Container Registry

## License

MIT License - see LICENSE file for details

## Author

- **iterrius** - [Instagram](https://www.instagram.com/iterrius_te/)