require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const auth = require('./middlewares/auth');
const { sign } = require('./utils/jwt');
const browserRouter = require('./routes/browser');
const adminRouter = require('./routes/admin');
const { proxySession, registerSession, unregisterSession, listActiveSessions } = require('./utils/proxySession');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { sessionPortMap } = require('./utils/proxySession');
require('events').EventEmitter.defaultMaxListeners = 50;

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware (allow localhost:3000 for dev)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'https://albizblog.online',
  ],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint (unprotected)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint to check active sessions (unprotected)
app.get('/api/debug/sessions', (req, res) => {
  const activeSessions = listActiveSessions();
  const sessionPortMap = require('./utils/proxySession').sessionPortMap;
  res.json({
    activeSessions,
    totalSessions: activeSessions.length,
    sessionIds: Object.keys(sessionPortMap),
    sessionPortMap: sessionPortMap,
    message: 'Use /api/debug/sessions to check active sessions and their port mappings'
  });
});

// Test proxy endpoint (unprotected)
app.get('/api/debug/test-proxy/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionPortMap = require('./utils/proxySession').sessionPortMap;
  const port = sessionPortMap[sessionId];
  
  res.json({
    sessionId,
    port,
    exists: !!port,
    target: port ? `http://127.0.0.1:${port}` : null,
    allSessions: sessionPortMap
  });
});

// Dev route to generate a test JWT
app.get('/api/token', (req, res) => {
  const requestedRole = req.query.role || 'admin';
  // For security: only allow admin role if a special header is present (e.g., X-Dev-Admin-Key)
  if (requestedRole === 'admin') {
    const devAdminKey = process.env.DEV_ADMIN_KEY ;
    if (req.headers['x-dev-admin-key'] !== devAdminKey) {
      return res.status(403).json({ error: 'Forbidden: admin token requires X-Dev-Admin-Key' });
    }
  }
  const user = {
    id: requestedRole === 'admin' ? 'adminuser' : 'testuser',
    role: requestedRole,
    email: requestedRole === 'admin' ? 'admin@example.com' : 'user@example.com',
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
app.use('/api/admin', adminRouter);

// Proxy session traffic to the correct Chromium container
app.use('/session/:sessionId', proxySession());

// Proxy /session/:sessionId/websockify directly to the container's /websockify endpoint
app.use('/session/:sessionId/websockify', (req, res, next) => {
  const sessionId = req.params.sessionId;
  const session = sessionPortMap[sessionId];

  if (!session || !session.containerIp) {
    return res.status(404).send('Session not found');
  }

  const target = `https://${session.containerIp}:3001`;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    secure: false,
    pathRewrite: {
      [`^/session/${sessionId}/websockify`]: '/websockify',
    }
  })(req, res, next);
});

// In your index.js, before the /session/:sessionId route
app.use('/websockify', (req, res, next) => {
  // Try to get sessionId from query or header
  const sessionId = req.query.sessionId || req.headers['x-session-id'];
  const session = sessionPortMap[sessionId];
  if (!session || !session.containerIp) {
    return res.status(404).send('Session not found');
  }
  const target = `https://${session.containerIp}:3001`;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    secure: false,
    pathRewrite: { '^/websockify': '/websockify' }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

// Export for use in other modules (e.g., browserRouter)
module.exports = { registerSession, unregisterSession }; 