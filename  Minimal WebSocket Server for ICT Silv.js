// Minimal WebSocket Server for ICT Silver Bullet
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 9000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebSocket server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ICT Silver Bullet - WebSocket Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #0066cc; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
          .card { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
          button { background: #0066cc; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>WebSocket Server Test</h1>
        <div class="card">
          <p>This is a minimal WebSocket server for testing the ICT Silver Bullet platform.</p>
          <p>Status: <span id="status">Disconnected</span></p>
          <p>Connected clients: <span id="clients">0</span></p>
          <button onclick="sendTestSignal()">Send Test Signal</button>
        </div>
        
        <div class="card">
          <h3>Messages:</h3>
          <pre id="messages">No messages yet</pre>
        </div>

        <script>
          // Connect to WebSocket
          const connectWs = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(\`\${protocol}//\${window.location.host}\`);
            
            ws.onopen = () => {
              document.getElementById('status').textContent = 'Connected';
              document.getElementById('status').style.color = 'green';
              console.log('WebSocket connected');
            };
            
            ws.onclose = () => {
              document.getElementById('status').textContent = 'Disconnected';
              document.getElementById('status').style.color = 'red';
              console.log('WebSocket disconnected');
              setTimeout(connectWs, 2000);
            };
            
            ws.onmessage = (event) => {
              const msgEl = document.getElementById('messages');
              try {
                const data = JSON.parse(event.data);
                msgEl.textContent = JSON.stringify(data, null, 2);
              } catch (err) {
                msgEl.textContent = event.data;
              }
            };
            
            window.currentWs = ws;
          };
          
          // Send a test signal
          function sendTestSignal() {
            if (!window.currentWs || window.currentWs.readyState !== 1) {
              alert('WebSocket not connected');
              return;
            }
            
            const signal = {
              id: Date.now().toString(),
              symbol: 'BTC/USD',
              type: Math.random() > 0.5 ? 'buy' : 'sell',
              entryPrice: 60000 + (Math.random() * 1000 - 500),
              timestamp: new Date().toISOString(),
              timeframe: 'D1'
            };
            
            window.currentWs.send(JSON.stringify(signal));
          }
          
          // Start connection
          connectWs();
          
          // Fetch client count every 2 seconds
          setInterval(() => {
            fetch('/api/stats')
              .then(res => res.json())
              .then(data => {
                document.getElementById('clients').textContent = data.count;
              })
              .catch(err => console.error('Error fetching client count:', err));
          }, 2000);
        </script>
      </body>
    </html>
  `);
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    count: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected', 
    message: 'Welcome to ICT Silver Bullet WebSocket Server',
    timestamp: new Date().toISOString()
  }));
  
  // Message handler
  ws.on('message', (message) => {
    try {
      // Try to parse as JSON
      const data = JSON.parse(message.toString());
      console.log('Received:', data);
      
      // Broadcast message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            ...data,
            broadcast: true
          }));
        }
      });
    } catch (error) {
      console.log('Received raw message:', message.toString());
    }
  });
  
  // Disconnection handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`WebSocket server running at http://0.0.0.0:${port}`);
  console.log(`Connect via ws://0.0.0.0:${port}`);
  
  // Send periodic test signals
  setInterval(() => {
    if (wss.clients.size > 0) {
      const signal = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        symbol: ['EUR/USD', 'BTC/USD', 'GBP/JPY', 'XAU/USD'][Math.floor(Math.random() * 4)],
        entryPrice: 100 + Math.random() * 100,
        timestamp: new Date().toISOString(),
        timeframe: 'D1',
        auto: true
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(signal));
        }
      });
      
      console.log(`Sent signal: ${signal.type} ${signal.symbol} @ ${signal.entryPrice}`);
    }
  }, 15000); // Every 15 seconds
});