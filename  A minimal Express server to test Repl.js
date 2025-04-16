// A minimal Express server to test Replit connectivity
import express from 'express';

const app = express();
const port = 5000;

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple test server is running',
    timestamp: new Date().toISOString()
  });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ICT Silver Bullet - Test Server</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
        button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        #response {
          margin-top: 20px;
          white-space: pre-wrap;
          background: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          display: none;
        }
      </style>
    </head>
    <body>
      <h1>ICT Silver Bullet Strategy</h1>
      <p>This is a test server to verify connectivity in the Replit environment.</p>
      
      <div class="card">
        <h2>Server Health Check</h2>
        <button onclick="checkHealth()">Test Connection</button>
        <div id="response"></div>
      </div>

      <script>
        function checkHealth() {
          const responseEl = document.getElementById('response');
          responseEl.style.display = 'block';
          responseEl.textContent = 'Checking connection...';
          
          fetch('/health')
            .then(response => response.json())
            .then(data => {
              responseEl.textContent = 'Success! Server responded with:\\n' + 
                JSON.stringify(data, null, 2);
            })
            .catch(error => {
              responseEl.textContent = 'Error: ' + error.message;
            });
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Simple test server running at http://0.0.0.0:${port}`);
});