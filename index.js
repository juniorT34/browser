require('dotenv').config();
const express = require('express');
const path = require('path');
const auth = require('./middlewares/auth');
const { sign } = require('./utils/jwt');
const browserRouter = require('./routes/browser');
const { proxySession, registerSession, unregisterSession } = require('./utils/proxySession');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health check endpoint (unprotected)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dev route to generate a test JWT
app.get('/api/dev/token', (req, res) => {
  // Example test user payload
  const user = {
    id: 'devuser',
    role: 'user',
    email: 'dev@example.com',
  };
  const token = sign(user);
  res.json({ token });
});

// Protected endpoint example
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'Protected content', user: req.user });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Disposable services API by juniorT34' });
});

app.use('/api/browser', browserRouter);

// Proxy session traffic to the correct Chromium container
app.use('/session/:sessionId', proxySession());

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

// Export for use in other modules (e.g., browserRouter)
module.exports = { registerSession, unregisterSession }; 