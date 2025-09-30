# Backend Deployment Instructions

## Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `https://github.com/adrianstanca1/final`
4. Configure the service:
   - **Name**: `asagents-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: `US East (Ohio)` or `US West (Oregon)`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (Free)

5. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   DB_HOST=<your-postgres-host>
   DB_PORT=5432
   DB_USER=<your-postgres-user>
   DB_PASSWORD=<your-postgres-password>
   DB_NAME=asagents_db
   DB_CONNECTION_LIMIT=10
   JWT_ACCESS_SECRET=<generate-random-secret>
   JWT_REFRESH_SECRET=<generate-random-secret>
   JWT_ACCESS_EXPIRES_IN=900
   JWT_REFRESH_EXPIRES_IN=604800
   GEMINI_API_KEY=AIzaSyB3J8F7b9NmXYIaVDvO6JFkjrWUTaRbEfM
   CORS_ORIGIN=https://final-fm0swwmd5-adrian-b7e84541.vercel.app
   IONOS_API_PREFIX=180a1703cc0e46e7ba577daaf6321944
   IONOS_API_SECRET=XXsr6IVem7_4-EHduB8SAvEZCxP9RfiYtQ1b4JmSIFwFOEgqW-VmXLNbrDDM6rjuKvZCl3uLzELq_nBtLorAIw
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. Click "Create Web Service"

## After Deployment

1. Get the backend URL (e.g., `https://asagents-backend.onrender.com`)
2. Update `.env.production` with the backend URL:
   ```
   VITE_API_URL=https://asagents-backend.onrender.com/api
   ```
3. Redeploy the frontend to Vercel

## Database Setup

If you need to create a new PostgreSQL database on Render:

1. Go to Render Dashboard
2. Click "New +" and select "PostgreSQL"
3. Configure:
   - **Name**: `asagents-postgres`
   - **Database Name**: `asagents_db`
   - **User**: `asagents_user`
   - **Region**: Same as your web service
   - **Plan**: `Starter` (Free)

4. After creation, get the connection details and update environment variables

## Testing

After deployment, test the admin login:
```bash
curl -X POST https://your-backend-url.onrender.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "adrian.stanca1@gmail.com", "password": "Cumparavinde1"}'
```
