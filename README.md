# Datalogger Simulator API

A Node.js API that simulates multiple dataloggers with realistic, continuously updating temperature and humidity readings.

## Features

- 5 simulated dataloggers (DL-001 through DL-005)
- Automatic updates every 30 seconds with realistic fluctuations
- Deviation detection for temperature and humidity
- Multiple endpoints for flexible integration
- CORS enabled for cross-origin requests

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev
```

The API will run on `http://localhost:3000`

## API Endpoints

### GET /api/datalogger
Returns data from a random datalogger.

**Response:**
```json
{
  "datalogger_id": "DL-001",
  "temperature": 22.5,
  "humidity": 55.0,
  "timestamp": "2024-11-05T10:30:00.000Z",
  "is_deviation": false,
  "deviation_type": "none"
}
```

### GET /api/datalogger/:id
Returns data from a specific datalogger (e.g., `/api/datalogger/DL-001`)

### POST /api/datalogger
Same as GET /api/datalogger but accepts POST requests

### GET /api/dataloggers
Returns data from all dataloggers at once

### GET /health
Health check endpoint

## Deviation Types

- `none` - No deviation
- `temperature_low` - Temperature below 18°C
- `temperature_high` - Temperature above 25°C
- `humidity_low` - Humidity below 40%
- `humidity_high` - Humidity above 65%
- `temperature_and_humidity` - Both are out of range

## Deploy to Render.com (FREE)

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo or use "Public Git repository"
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"
6. Your API will be live at `https://your-service.onrender.com`

## Deploy to Railway.app (FREE)

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js and deploy
5. Your API will be live at the provided URL

## Deploy to Fly.io (FREE)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
flyctl launch
flyctl deploy
```

## Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-datalogger-api

# Deploy
git push heroku main

# Your API will be at https://your-datalogger-api.herokuapp.com
```

## Using with n8n

1. Deploy the API using any method above
2. In n8n, use HTTP Request node
3. Set:
   - **Method:** GET or POST
   - **URL:** `https://your-deployed-url.com/api/datalogger`
4. The response will match your expected format exactly

## Example n8n HTTP Request Configuration

```
Method: GET
URL: https://your-api-url.com/api/datalogger
Authentication: None
Response Format: JSON
```

The response will automatically match your required format:
```json
{
  "datalogger_id": "...",
  "temperature": ...,
  "humidity": ...,
  "timestamp": "...",
  "is_deviation": ...,
  "deviation_type": "..."
}
```

## Customization

To modify dataloggers, temperature ranges, or update frequency, edit `server.js`:

```javascript
// Add/remove dataloggers
const dataloggers = {
  'DL-001': { temp: 22.5, humidity: 55, lastUpdate: Date.now() },
  // Add more here...
};

// Adjust thresholds
const TEMP_MIN = 18;
const TEMP_MAX = 25;
const HUMIDITY_MIN = 40;
const HUMIDITY_MAX = 65;

// Change update interval (milliseconds)
setInterval(updateSensorReadings, 30000); // 30 seconds
```

## License

MIT
