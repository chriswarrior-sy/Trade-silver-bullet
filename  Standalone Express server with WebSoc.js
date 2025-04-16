// Standalone Express server with WebSocket for the ICT Silver Bullet platform
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Add CORS middleware
app.use(cors());
app.use(express.json());

// Market data for the ICT Silver Bullet analysis
const forexMarkets = ["EUR/USD", "GBP/JPY", "USD/CAD", "AUD/USD"];
const cryptoMarkets = ["BTC/USD", "ETH/USD"];
const commodityMarkets = ["XAU/USD", "OIL/USD"];

// Track connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages from clients
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
});

// Broadcast function for sending signals to all connected clients
function broadcastSignal(signal) {
  const message = JSON.stringify(signal);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ICT Silver Bullet Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #0066cc; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; }
          button { background: #0066cc; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
          pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>ICT Silver Bullet - Trading Signals Server</h1>
        <div class="card">
          <h2>Server Status</h2>
          <p>✅ Server is running</p>
          <p>✅ WebSocket server is active</p>
          <p>🔌 Connected clients: <span id="clientCount">0</span></p>
        </div>
        
        <div class="card">
          <h2>Manual Signal Generator</h2>
          <div style="margin-bottom: 10px;">
            <label>Symbol: 
              <select id="symbolSelect">
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/JPY">GBP/JPY</option>
                <option value="BTC/USD">BTC/USD</option>
                <option value="XAU/USD">XAU/USD</option>
              </select>
            </label>
          </div>
          <div style="margin-bottom: 10px;">
            <label>Signal Type: 
              <select id="signalType">
                <option value="buy">BUY</option>
                <option value="sell">SELL</option>
              </select>
            </label>
          </div>
          <div style="margin-bottom: 10px;">
            <label>Price: <input type="number" id="priceInput" value="0" step="0.01"></label>
          </div>
          <button onclick="generateSignal()">Send Signal</button>
          <div id="signalResult" style="margin-top: 10px;"></div>
        </div>
        
        <div class="card">
          <h2>API Endpoints</h2>
          <ul>
            <li><a href="/health" target="_blank">/health</a> - Server health check</li>
            <li><a href="/api/markets" target="_blank">/api/markets</a> - Get all markets</li>
            <li><a href="/api/candles?symbol=EUR/USD" target="_blank">/api/candles?symbol=EUR/USD</a> - Get candlestick data</li>
            <li><a href="/api/analysis" target="_blank">/api/analysis</a> - Get ICT analysis</li>
          </ul>
        </div>
        
        <div class="card">
          <h2>Last Signal Sent</h2>
          <pre id="lastSignal">No signals sent yet</pre>
        </div>
        
        <script>
          // Update client count every 2 seconds
          setInterval(() => {
            fetch('/api/stats')
              .then(res => res.json())
              .then(data => {
                document.getElementById('clientCount').textContent = data.clients;
              })
              .catch(err => console.error('Error fetching stats:', err));
          }, 2000);
          
          // Generate and send a signal
          function generateSignal() {
            const symbol = document.getElementById('symbolSelect').value;
            const type = document.getElementById('signalType').value;
            const priceInput = document.getElementById('priceInput');
            let price = parseFloat(priceInput.value);
            
            // If price is 0 or invalid, use a default price based on the symbol
            if (!price) {
              if (symbol === 'EUR/USD') price = 1.09;
              else if (symbol === 'GBP/JPY') price = 176.50;
              else if (symbol === 'BTC/USD') price = 60000;
              else if (symbol === 'XAU/USD') price = 1900;
              else price = 100;
              
              priceInput.value = price;
            }
            
            fetch('/api/signals/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbol, type, price })
            })
            .then(res => res.json())
            .then(data => {
              document.getElementById('signalResult').innerHTML = 
                '<span style="color: green">✓ Signal sent successfully!</span>';
              document.getElementById('lastSignal').textContent = 
                JSON.stringify(data, null, 2);
            })
            .catch(err => {
              document.getElementById('signalResult').innerHTML = 
                '<span style="color: red">Error: ' + err.message + '</span>';
            });
          }
        </script>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ICT Silver Bullet server is running',
    timestamp: new Date().toISOString()
  });
});

// Get server stats 
app.get('/api/stats', (req, res) => {
  res.json({
    clients: clients.size,
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
  const symbol = req.query.symbol;
  const timeframe = req.query.timeframe || 'D1';
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }
  
  res.json(generateCandleData(symbol, timeframe));
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
  
  console.log(`Sent ${type} signal for ${symbol} at ${price}`);
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
}, 30000); // Check every 30 seconds

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

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`ICT Silver Bullet server running at http://0.0.0.0:${port}`);
  console.log(`WebSocket server running on ws://0.0.0.0:${port}`);
});