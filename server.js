const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Simulated dataloggers with their current states (now with pressure)
const dataloggers = {
  'DL-001': { temp: 22.5, humidity: 55, pressure: 1013.2, lastUpdate: Date.now() },
  'DL-002': { temp: 21.8, humidity: 58, pressure: 1012.8, lastUpdate: Date.now() },
  'DL-003': { temp: 23.2, humidity: 52, pressure: 1014.1, lastUpdate: Date.now() },
  'DL-004': { temp: 20.5, humidity: 60, pressure: 1011.5, lastUpdate: Date.now() },
  'DL-005': { temp: 24.1, humidity: 48, pressure: 1015.3, lastUpdate: Date.now() }
};

// Thresholds
const TEMP_MIN = 18;
const TEMP_MAX = 25;
const HUMIDITY_MIN = 40;
const HUMIDITY_MAX = 65;
const PRESSURE_MIN = 1000;
const PRESSURE_MAX = 1020;

// Function to update sensor readings with realistic fluctuations
function updateSensorReadings() {
  Object.keys(dataloggers).forEach(id => {
    const logger = dataloggers[id];
    
    // Add small random fluctuations
    logger.temp += (Math.random() - 0.5) * 1;
    logger.humidity += (Math.random() - 0.5) * 4;
    logger.pressure += (Math.random() - 0.5) * 2;
    
    // Keep values within reasonable bounds
    logger.temp = Math.max(15, Math.min(30, logger.temp));
    logger.humidity = Math.max(30, Math.min(80, logger.humidity));
    logger.pressure = Math.max(990, Math.min(1030, logger.pressure));
    
    // Round to 1 decimal place
    logger.temp = Math.round(logger.temp * 10) / 10;
    logger.humidity = Math.round(logger.humidity * 10) / 10;
    logger.pressure = Math.round(logger.pressure * 10) / 10;
    
    logger.lastUpdate = Date.now();
  });
}

// Update readings every 30 seconds
setInterval(updateSensorReadings, 30000);

// Function to check if there's a deviation
function checkDeviation(temp, humidity, pressure) {
  const tempDeviation = temp < TEMP_MIN || temp > TEMP_MAX;
  const humidityDeviation = humidity < HUMIDITY_MIN || humidity > HUMIDITY_MAX;
  const pressureDeviation = pressure < PRESSURE_MIN || pressure > PRESSURE_MAX;
  
  if (tempDeviation && humidityDeviation && pressureDeviation) {
    return { isDeviation: true, type: 'temperature_humidity_pressure' };
  } else if (tempDeviation && humidityDeviation) {
    return { isDeviation: true, type: 'temperature_and_humidity' };
  } else if (tempDeviation && pressureDeviation) {
    return { isDeviation: true, type: 'temperature_and_pressure' };
  } else if (humidityDeviation && pressureDeviation) {
    return { isDeviation: true, type: 'humidity_and_pressure' };
  } else if (tempDeviation) {
    return { isDeviation: true, type: temp < TEMP_MIN ? 'temperature_low' : 'temperature_high' };
  } else if (humidityDeviation) {
    return { isDeviation: true, type: humidity < HUMIDITY_MIN ? 'humidity_low' : 'humidity_high' };
  } else if (pressureDeviation) {
    return { isDeviation: true, type: pressure < PRESSURE_MIN ? 'pressure_low' : 'pressure_high' };
  }
  
  return { isDeviation: false, type: 'none' };
}

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Main endpoint - returns data for a random datalogger
app.get('/api/datalogger', (req, res) => {
  const dataloggerIds = Object.keys(dataloggers);
  const randomId = dataloggerIds[Math.floor(Math.random() * dataloggerIds.length)];
  const logger = dataloggers[randomId];
  
  const deviation = checkDeviation(logger.temp, logger.humidity, logger.pressure);
  
  res.json({
    datalogger_id: randomId,
    temperature: logger.temp,
    humidity: logger.humidity,
    pressure: logger.pressure,
    timestamp: new Date().toISOString(),
    is_deviation: deviation.isDeviation,
    deviation_type: deviation.type
  });
});

// Endpoint for specific datalogger
app.get('/api/datalogger/:id', (req, res) => {
  const id = req.params.id;
  const logger = dataloggers[id];
  
  if (!logger) {
    return res.status(404).json({ error: 'Datalogger not found' });
  }
  
  const deviation = checkDeviation(logger.temp, logger.humidity, logger.pressure);
  
  res.json({
    datalogger_id: id,
    temperature: logger.temp,
    humidity: logger.humidity,
    pressure: logger.pressure,
    timestamp: new Date().toISOString(),
    is_deviation: deviation.isDeviation,
    deviation_type: deviation.type
  });
});

// POST endpoint (returns the same format)
app.post('/api/datalogger', (req, res) => {
  const dataloggerIds = Object.keys(dataloggers);
  const randomId = dataloggerIds[Math.floor(Math.random() * dataloggerIds.length)];
  const logger = dataloggers[randomId];
  
  const deviation = checkDeviation(logger.temp, logger.humidity, logger.pressure);
  
  res.json({
    datalogger_id: randomId,
    temperature: logger.temp,
    humidity: logger.humidity,
    pressure: logger.pressure,
    timestamp: new Date().toISOString(),
    is_deviation: deviation.isDeviation,
    deviation_type: deviation.type
  });
});

// List all dataloggers
app.get('/api/dataloggers', (req, res) => {
  const results = Object.keys(dataloggers).map(id => {
    const logger = dataloggers[id];
    const deviation = checkDeviation(logger.temp, logger.humidity, logger.pressure);
    
    return {
      datalogger_id: id,
      temperature: logger.temp,
      humidity: logger.humidity,
      pressure: logger.pressure,
      timestamp: new Date().toISOString(),
      is_deviation: deviation.isDeviation,
      deviation_type: deviation.type
    };
  });
  
  res.json(results);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dataloggers: Object.keys(dataloggers).length });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Datalogger Simulator API',
    endpoints: {
      'GET /api/datalogger': 'Get random datalogger reading',
      'GET /api/datalogger/:id': 'Get specific datalogger reading',
      'POST /api/datalogger': 'Get random datalogger reading (POST)',
      'GET /api/dataloggers': 'Get all dataloggers readings',
      'GET /health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Datalogger API running on port ${PORT}`);
  console.log(`Available dataloggers: ${Object.keys(dataloggers).join(', ')}`);
});
