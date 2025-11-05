# Using Datalogger API with n8n

## Step 1: Deploy Your API

### Option A: Render.com (Easiest, FREE)
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Choose "Public Git repository" and paste: `https://github.com/YOUR-USERNAME/datalogger-api`
   OR upload the files directly
4. Configure:
   - **Name:** datalogger-simulator
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"
6. Wait 2-3 minutes for deployment
7. Copy your URL (e.g., `https://datalogger-simulator.onrender.com`)

### Option B: Railway.app (Also FREE)
1. Go to https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub"
3. Connect repository
4. Railway auto-detects and deploys
5. Copy your URL from the deployment

## Step 2: Test Your API

Open in browser: `https://your-api-url.com/api/datalogger`

You should see:
```json
{
  "datalogger_id": "DL-003",
  "temperature": 22.5,
  "humidity": 55.0,
  "timestamp": "2024-11-05T10:30:00.000Z",
  "is_deviation": false,
  "deviation_type": "none"
}
```

## Step 3: Configure n8n

### Simple Workflow (Single Request)

1. **Add HTTP Request Node**
   - Click "+" → Search "HTTP Request"
   - Configure:
     - **Method:** GET
     - **URL:** `https://your-api-url.com/api/datalogger`
     - **Authentication:** None
     - **Response Format:** JSON

2. **Test It**
   - Click "Execute Node"
   - You'll see the datalogger data

### Polling Workflow (Continuous Monitoring)

1. **Add Schedule Trigger**
   - Trigger Node → Schedule Trigger
   - Set interval: Every 1 minute (or as needed)

2. **Add HTTP Request Node**
   - Same configuration as above

3. **Add IF Node** (Optional - for deviation alerts)
   - Add IF node after HTTP Request
   - Condition: `{{ $json.is_deviation }}` equals `true`

4. **Add Actions**
   - **TRUE branch:** Send email, Slack message, etc.
   - **FALSE branch:** Just log or do nothing

### Example: Send Email on Deviation

```
Schedule Trigger (every 5 min)
    ↓
HTTP Request (get datalogger data)
    ↓
IF (is_deviation = true)
    ↓
    TRUE → Send Email Node
    FALSE → No Operation
```

### Email Node Configuration:
- **To:** your-email@example.com
- **Subject:** `Datalogger Alert: {{ $json.deviation_type }}`
- **Text:** 
```
Datalogger ID: {{ $json.datalogger_id }}
Temperature: {{ $json.temperature }}°C
Humidity: {{ $json.humidity }}%
Deviation Type: {{ $json.deviation_type }}
Timestamp: {{ $json.timestamp }}
```

## Step 4: Advanced - Multiple Dataloggers

To check all dataloggers at once:

1. **HTTP Request Node**
   - **URL:** `https://your-api-url.com/api/dataloggers`
   - Returns array of all dataloggers

2. **Split In Batches Node**
   - Splits array into individual items

3. **IF Node**
   - Check each for deviations

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/datalogger` | GET/POST | Random datalogger |
| `/api/datalogger/DL-001` | GET | Specific datalogger |
| `/api/dataloggers` | GET | All dataloggers |
| `/health` | GET | Health check |

## Common Issues

### Issue: "Connection refused"
- **Solution:** Make sure your API is deployed and running. Check the deployment logs.

### Issue: "CORS error"
- **Solution:** Already handled in the API code. If still occurring, add this header in n8n:
  - Header Name: `Origin`
  - Header Value: `*`

### Issue: Data not updating
- **Solution:** The API updates every 30 seconds. Each request gets current data.

## Tips

1. **Free Tier Limitations:**
   - Render.com: API sleeps after 15 min of inactivity (wakes on request)
   - Railway: 500 hours/month free

2. **Keep API Awake:**
   - Add a schedule trigger in n8n that pings `/health` every 10 minutes

3. **Customize Thresholds:**
   - Edit `server.js` and redeploy to change temperature/humidity ranges

## Example n8n JSON Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 5
            }
          ]
        }
      },
      "name": "Every 5 minutes",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://your-api-url.com/api/datalogger",
        "options": {}
      },
      "name": "Get Datalogger",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    }
  ],
  "connections": {
    "Every 5 minutes": {
      "main": [
        [
          {
            "node": "Get Datalogger",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

Import this into n8n and replace `your-api-url.com` with your actual URL!
