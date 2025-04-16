// A minimal Express server with a bundled HTML client for testing
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Market data for the ICT Silver Bullet analysis
const forexMarkets = ["EUR/USD", "GBP/JPY", "USD/CAD", "AUD/USD"];
const cryptoMarkets = ["BTC/USD", "ETH/USD"];
const commodityMarkets = ["XAU/USD", "OIL/USD"];

// Serve static files from the public directory
app.use('/static', express.static('server/public'));

// Middleware for JSON parsing
app.use(express.json());

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
});

// Function to broadcast signals to all connected WebSocket clients
function broadcastSignal(signal) {
  const message = JSON.stringify(signal);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Basic API endpoints
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Get market data
app.get('/api/markets', (req, res) => {
  const marketType = req.query.market || 'all';
  const timeframe = req.query.timeframe || 'D1';
  
  let markets = [];
  
  switch (marketType) {
    case 'forex':
      markets = forexMarkets;
      break;
    case 'crypto':
      markets = cryptoMarkets;
      break;
    case 'commodities':
      markets = commodityMarkets;
      break;
    default:
      // For 'all', take 3 most active markets
      markets = [...forexMarkets.slice(0, 2), ...cryptoMarkets.slice(0, 1)];
      break;
  }
  
  const response = markets.map(symbol => {
    return {
      symbol,
      name: getMarketName(symbol),
      price: getBasePrice(symbol) * (1 + (Math.random() * 0.01 - 0.005)),
      change: (Math.random() * 2 - 0.5).toFixed(2),
      signal: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'buy' : 'sell') : null,
      timeframe
    };
  });
  
  res.json(response);
});

// Get candlestick data for a specific market
app.get('/api/candles', (req, res) => {
  const marketType = req.query.market || 'all';
  const timeframe = req.query.timeframe || 'D1';
  
  let markets = [];
  
  switch (marketType) {
    case 'forex':
      markets = forexMarkets;
      break;
    case 'crypto':
      markets = cryptoMarkets;
      break;
    case 'commodities':
      markets = commodityMarkets;
      break;
    default:
      // For 'all', take 3 most active markets
      markets = [...forexMarkets.slice(0, 2), ...cryptoMarkets.slice(0, 1)];
      break;
  }
  
  const response = {};
  
  markets.forEach(symbol => {
    response[symbol] = generateCandleData(symbol, timeframe);
  });
  
  res.json(response);
});

// Get ICT analysis data
app.get('/api/analysis', (req, res) => {
  const marketType = req.query.market || 'all';
  const timeframe = req.query.timeframe || 'D1';
  
  let markets = [];
  
  switch (marketType) {
    case 'forex':
      markets = forexMarkets;
      break;
    case 'crypto':
      markets = cryptoMarkets;
      break;
    case 'commodities':
      markets = commodityMarkets;
      break;
    default:
      // For 'all', take 3 most active markets
      markets = [...forexMarkets.slice(0, 2), ...cryptoMarkets.slice(0, 1)];
      break;
  }
  
  const response = {};
  
  markets.forEach(symbol => {
    response[symbol] = {
      equalHighs: Math.random() > 0.5,
      equalLows: Math.random() > 0.5,
      fairValueGap: Math.random() > 0.7,
      liquiditySweep: Math.random() > 0.7,
      breaker: Math.random() > 0.3,
      orderBlocks: ['bullish', 'bearish', 'none'][Math.floor(Math.random() * 3)],
      bos: ['bullish', 'bearish', 'none'][Math.floor(Math.random() * 3)],
      inducement: Math.random() > 0.7
    };
  });
  
  res.json(response);
});

// Get signal points for charts
app.get('/api/signal-points', (req, res) => {
  const marketType = req.query.market || 'all';
  const timeframe = req.query.timeframe || 'D1';
  
  let markets = [];
  
  switch (marketType) {
    case 'forex':
      markets = forexMarkets;
      break;
    case 'crypto':
      markets = cryptoMarkets;
      break;
    case 'commodities':
      markets = commodityMarkets;
      break;
    default:
      // For 'all', take 3 most active markets
      markets = [...forexMarkets.slice(0, 2), ...cryptoMarkets.slice(0, 1)];
      break;
  }
  
  const response = {};
  
  markets.forEach(symbol => {
    const candles = generateCandleData(symbol, timeframe);
    const numSignals = Math.floor(Math.random() * 5) + 1;
    const signals = [];
    
    for (let i = 0; i < numSignals; i++) {
      const candleIndex = Math.floor(Math.random() * candles.length);
      const candle = candles[candleIndex];
      const isBuy = Math.random() > 0.5;
      
      signals.push({
        time: candle.timestamp,
        position: isBuy ? 'aboveBar' : 'belowBar',
        shape: 'circle',
        color: isBuy ? '#4CAF50' : '#FF5252'
      });
    }
    
    response[symbol] = signals;
  });
  
  res.json(response);
});

// Get silver bullet trend lines
app.get('/api/silver-bullet-lines', (req, res) => {
  const marketType = req.query.market || 'all';
  const timeframe = req.query.timeframe || 'D1';
  
  let markets = [];
  
  switch (marketType) {
    case 'forex':
      markets = forexMarkets;
      break;
    case 'crypto':
      markets = cryptoMarkets;
      break;
    case 'commodities':
      markets = commodityMarkets;
      break;
    default:
      // For 'all', take 3 most active markets
      markets = [...forexMarkets.slice(0, 2), ...cryptoMarkets.slice(0, 1)];
      break;
  }
  
  const response = {};
  
  markets.forEach(symbol => {
    const candles = generateCandleData(symbol, timeframe);
    const lines = [];
    
    // Create a simplified trend line
    for (let i = 0; i < candles.length; i++) {
      lines.push({
        time: candles[i].timestamp,
        value: candles[i].close * (1 + (Math.random() * 0.005 - 0.0025))
      });
    }
    
    response[symbol] = lines;
  });
  
  res.json(response);
});

// Get active signals
app.get('/api/signals/active', (req, res) => {
  const numSignals = Math.floor(Math.random() * 5) + 2;
  const signals = [];
  
  const allMarkets = [...forexMarkets, ...cryptoMarkets, ...commodityMarkets];
  
  for (let i = 0; i < numSignals; i++) {
    const marketIndex = Math.floor(Math.random() * allMarkets.length);
    const symbol = allMarkets[marketIndex];
    const isBuy = Math.random() > 0.5;
    const profitLoss = (Math.random() * 4 - 1).toFixed(2);
    
    signals.push({
      market: getMarketName(symbol),
      symbol,
      type: isBuy ? 'buy' : 'sell',
      profitLoss: parseFloat(profitLoss),
      time: `${Math.floor(Math.random() * 12) + 1}h ago`
    });
  }
  
  res.json(signals);
});

// Generate a new signal
app.post('/api/signals/generate', (req, res) => {
  const { symbol, type, price } = req.body;
  
  if (!symbol || !type || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Create new signal
  const signal = {
    id: Date.now().toString(),
    market: getMarketName(symbol),
    symbol,
    type,
    entryPrice: parseFloat(price),
    timestamp: new Date().toISOString(),
    profitLoss: null,
    status: 'active',
    timeframe: req.body.timeframe || 'D1'
  };
  
  // Broadcast to WebSocket clients
  broadcastSignal(signal);
  
  res.json(signal);
});

// Simulate periodic signals
setInterval(() => {
  if (Math.random() < 0.2 && clients.size > 0) { // 20% chance if clients connected
    const allMarkets = [...forexMarkets, ...cryptoMarkets, ...commodityMarkets];
    const randomMarket = allMarkets[Math.floor(Math.random() * allMarkets.length)];
    const signalType = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = getBasePrice(randomMarket) * (1 + (Math.random() * 0.01 - 0.005));
    
    const signal = {
      id: Date.now().toString(),
      market: getMarketName(randomMarket),
      symbol: randomMarket,
      type: signalType,
      entryPrice: price,
      timestamp: new Date().toISOString(),
      profitLoss: null,
      status: 'active',
      timeframe: 'D1'
    };
    
    console.log(`Broadcasting ${signalType} signal for ${randomMarket} at ${price}`);
    broadcastSignal(signal);
  }
}, 20000); // Check every 20 seconds

// Helper functions
function getBasePrice(symbol) {
  switch (symbol) {
    case 'EUR/USD':
      return 1.09;
    case 'GBP/JPY':
      return 176.50;
    case 'USD/CAD':
      return 1.35;
    case 'AUD/USD':
      return 0.65;
    case 'BTC/USD':
      return 60000;
    case 'ETH/USD':
      return 2500;
    case 'XAU/USD':
      return 1900;
    case 'OIL/USD':
      return 75;
    default:
      return 100;
  }
}

function getMarketName(symbol) {
  switch (symbol) {
    case 'EUR/USD':
      return 'Euro / US Dollar';
    case 'GBP/JPY':
      return 'British Pound / Japanese Yen';
    case 'USD/CAD':
      return 'US Dollar / Canadian Dollar';
    case 'AUD/USD':
      return 'Australian Dollar / US Dollar';
    case 'BTC/USD':
      return 'Bitcoin / US Dollar';
    case 'ETH/USD':
      return 'Ethereum / US Dollar';
    case 'XAU/USD':
      return 'Gold / US Dollar';
    case 'OIL/USD':
      return 'Crude Oil / US Dollar';
    default:
      return symbol;
  }
}

function generateCandleData(symbol, timeframe) {
  const candles = [];
  const basePrice = getBasePrice(symbol);
  const volatility = getVolatility(symbol);
  const interval = getTimeframeInterval(timeframe);
  const now = Date.now();
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (interval * (100 - i));
    const change = (Math.random() * 2 - 1) * volatility;
    currentPrice = currentPrice * (1 + change);
    
    const open = currentPrice;
    const close = currentPrice * (1 + (Math.random() * 0.01 - 0.005));
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = Math.random() * 1000 + 500;
    
    candles.push({
      timestamp,
      open,
      high,
      close,
      low,
      volume
    });
  }
  
  return candles;
}

function getVolatility(symbol) {
  if (symbol.includes('BTC') || symbol.includes('ETH')) {
    return 0.02; // 2% for crypto
  } else if (symbol.includes('XAU') || symbol.includes('OIL')) {
    return 0.01; // 1% for commodities
  } else {
    return 0.005; // 0.5% for forex
  }
}

function getTimeframeInterval(timeframe) {
  switch(timeframe) {
    case 'M1':
      return 60 * 1000; // 1 minute
    case 'M5':
      return 5 * 60 * 1000; // 5 minutes
    case 'M15':
      return 15 * 60 * 1000; // 15 minutes
    case 'M30':
      return 30 * 60 * 1000; // 30 minutes
    case 'H1':
      return 60 * 60 * 1000; // 1 hour
    case 'H4':
      return 4 * 60 * 60 * 1000; // 4 hours
    case 'D1':
      return 24 * 60 * 60 * 1000; // 1 day
    case 'W1':
      return 7 * 24 * 60 * 60 * 1000; // 1 week
    default:
      return 24 * 60 * 60 * 1000; // Default to 1 day
  }
}

// Serve the HTML with embedded client-side JS
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ICT Silver Bullet - Connection Test</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
          color: #333;
        }
        h1 {
          color: #0066cc;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          background: #f9f9f9;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin: 15px 0;
        }
        button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .response {
          margin-top: 20px;
          white-space: pre-wrap;
          background: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          display: none;
        }
        .success {
          color: green;
          font-weight: bold;
        }
        .error {
          color: red;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>ICT Silver Bullet - Connection Tester</h1>
      <p>This tool helps diagnose connection issues between client and server in the Replit environment.</p>
      
      <div class="card">
        <h2>Test API Connections</h2>
        <div class="button-group">
          <button onclick="testDirectApi()">Test Direct API</button>
          <button onclick="testMarketData()">Test Market Data</button>
          <button onclick="testAnalysisData()">Test Analysis Data</button>
        </div>
        <div id="apiResponse" class="response"></div>
      </div>

      <div class="card">
        <h2>Server Health</h2>
        <div class="button-group">
          <button onclick="checkHealth()">Check Server Health</button>
        </div>
        <div id="healthResponse" class="response"></div>
      </div>

      <div class="card">
        <h2>Connection Information</h2>
        <p>Browser URL: <span id="browserUrl"></span></p>
        <p>Protocol: <span id="protocol"></span></p>
        <p>Host: <span id="host"></span></p>
        <p>Port: <span id="port"></span></p>
      </div>

      <script>
        // Display connection information
        document.getElementById('browserUrl').textContent = window.location.href;
        document.getElementById('protocol').textContent = window.location.protocol;
        document.getElementById('host').textContent = window.location.hostname;
        document.getElementById('port').textContent = window.location.port || '(default)';

        // Test direct API endpoint
        function testDirectApi() {
          const responseEl = document.getElementById('apiResponse');
          responseEl.style.display = 'block';
          responseEl.textContent = 'Testing API connection...';
          responseEl.className = 'response';
          
          fetch('/api/test')
            .then(response => response.json())
            .then(data => {
              responseEl.innerHTML = '<span class="success">Success!</span> Direct API test successful:\\n' + 
                JSON.stringify(data, null, 2);
            })
            .catch(error => {
              responseEl.innerHTML = '<span class="error">Error!</span> ' + error.message;
            });
        }

        // Test market data endpoint
        function testMarketData() {
          const responseEl = document.getElementById('apiResponse');
          responseEl.style.display = 'block';
          responseEl.textContent = 'Fetching market data...';
          responseEl.className = 'response';
          
          fetch('/api/markets')
            .then(response => response.json())
            .then(data => {
              responseEl.innerHTML = '<span class="success">Success!</span> Received market data:\\n' + 
                JSON.stringify(data, null, 2);
            })
            .catch(error => {
              responseEl.innerHTML = '<span class="error">Error!</span> ' + error.message;
            });
        }

        // Test analysis data endpoint
        function testAnalysisData() {
          const responseEl = document.getElementById('apiResponse');
          responseEl.style.display = 'block';
          responseEl.textContent = 'Fetching market analysis...';
          responseEl.className = 'response';
          
          fetch('/api/analysis')
            .then(response => response.json())
            .then(data => {
              responseEl.innerHTML = '<span class="success">Success!</span> Received analysis data:\\n' + 
                JSON.stringify(data, null, 2);
            })
            .catch(error => {
              responseEl.innerHTML = '<span class="error">Error!</span> ' + error.message;
            });
        }

        // Check server health endpoint
        function checkHealth() {
          const responseEl = document.getElementById('healthResponse');
          responseEl.style.display = 'block';
          responseEl.textContent = 'Checking server health...';
          responseEl.className = 'response';
          
          fetch('/health')
            .then(response => response.json())
            .then(data => {
              responseEl.innerHTML = '<span class="success">Success!</span> Server health check passed:\\n' + 
                JSON.stringify(data, null, 2);
            })
            .catch(error => {
              responseEl.innerHTML = '<span class="error">Error!</span> ' + error.message;
            });
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`ICT Silver Bullet test server running at http://0.0.0.0:${port}`);
  console.log(`WebSocket server running on ws://0.0.0.0:${port}/ws`);
});