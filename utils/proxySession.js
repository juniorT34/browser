const { createProxyMiddleware } = require('http-proxy-middleware');

// In-memory sessionId -> port mapping (replace with Redis for production)
const sessionPortMap = {};

function registerSession(sessionId, port) {
  sessionPortMap[sessionId] = port;
  console.log(`Session registered: ${sessionId} -> port ${port}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

function unregisterSession(sessionId) {
  delete sessionPortMap[sessionId];
  console.log(`Session unregistered: ${sessionId}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

// Middleware to proxy /session/:sessionId/* to the correct local port
function proxySession() {
  return createProxyMiddleware({
    target: 'http://127.0.0.1', // dummy, will be rewritten dynamically
    changeOrigin: true,
    ws: true,
    router: function (req) {
      const sessionId = req.params.sessionId;
      const port = sessionPortMap[sessionId];
      
      console.log(`Proxy request for session: ${sessionId}`);
      console.log(`Available sessions:`, Object.keys(sessionPortMap));
      console.log(`Port for session ${sessionId}:`, port);
      
      if (!port) {
        console.log(`Session ${sessionId} not found in sessionPortMap`);
        return null;
      }
      
      const target = `http://127.0.0.1:${port}`;
      console.log(`Routing to: ${target}`);
      return target;
    },
    pathRewrite: function (path, req) {
      // Remove /session/:sessionId from the start of the path
      const rewrittenPath = path.replace(/^\/session\/[^\/]+/, '');
      console.log(`Path rewrite: ${path} -> ${rewrittenPath}`);
      return rewrittenPath;
    },
    onProxyReq: function (proxyReq, req, res) {
      const sessionId = req.params.sessionId;
      const port = sessionPortMap[sessionId];
      
      if (!port) {
        console.log(`Session ${sessionId} not found, returning 404`);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Session not found',
          sessionId: sessionId,
          availableSessions: Object.keys(sessionPortMap),
          message: 'The session may have expired or never existed. Please start a new session.'
        }));
        return;
      }
      
      console.log(`Proxying request for session ${sessionId} to port ${port}`);
    },
    onError: function (err, req, res) {
      console.error('Proxy error:', err);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Proxy error',
        message: 'Failed to connect to session container',
        details: err.message
      }));
    }
  });
}

// Debug function to list all active sessions
function listActiveSessions() {
  return Object.keys(sessionPortMap).map(sessionId => ({
    sessionId,
    port: sessionPortMap[sessionId]
  }));
}

module.exports = {
  proxySession,
  registerSession,
  unregisterSession,
  sessionPortMap, // export for advanced use/testing
  listActiveSessions
}; 