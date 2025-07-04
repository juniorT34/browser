const { createProxyMiddleware } = require('http-proxy-middleware');

// In-memory sessionId -> port mapping (replace with Redis for production)
const sessionPortMap = {};

function registerSession(sessionId, port) {
  sessionPortMap[sessionId] = port;
}

function unregisterSession(sessionId) {
  delete sessionPortMap[sessionId];
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
      if (!port) return null;
      return `http://127.0.0.1:${port}`;
    },
    pathRewrite: function (path, req) {
      // Remove /session/:sessionId from the start of the path
      return path.replace(/^\/session\/[^\/]+/, '');
    },
    onProxyReq: function (proxyReq, req, res) {
      const sessionId = req.params.sessionId;
      const port = sessionPortMap[sessionId];
      if (!port) {
        res.statusCode = 404;
        res.end('Session not found');
      }
    }
  });
}

module.exports = {
  proxySession,
  registerSession,
  unregisterSession,
  sessionPortMap, // export for advanced use/testing
}; 