// WebSocket client test for ICT Silver Bullet
const WebSocket = require('ws');

console.log('Starting WebSocket client test for ICT Silver Bullet...');
const server = process.env.SERVER || 'localhost:8080';

// Create a WebSocket connection
const ws = new WebSocket(`ws://${server}`);

// Connection opened
ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send test message
  ws.send(JSON.stringify({
    type: 'client_connect',
    client: 'test_client',
    timestamp: new Date().toISOString()
  }));
  
  // Set up a ping interval to keep the connection alive
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
      console.log('Sent ping to keep connection alive');
    }
  }, 30000);
});

// Listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('Received message:', message);
    
    if (message.type === 'buy' || message.type === 'sell') {
      console.log(`
        ============================================================
        🚨 NEW SIGNAL ALERT 🚨
        
        Symbol: ${message.symbol}
        Type: ${message.type.toUpperCase()}
        Price: ${message.entryPrice}
        Time: ${new Date(message.timestamp).toLocaleString()}
        ============================================================
      `);
    }
  } catch (err) {
    console.error('Error parsing message:', err);
    console.log('Raw message:', data);
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle close
ws.on('close', () => {
  console.log('Connection closed');
  
  // Try to reconnect after 5 seconds
  console.log('Attempting to reconnect in 5 seconds...');
  setTimeout(() => {
    console.log('Reconnecting...');
    // Restart process
    process.exit(0);
  }, 5000);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing connection...');
  ws.close();
  process.exit(0);
});