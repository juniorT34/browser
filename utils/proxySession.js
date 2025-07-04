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
  return (req, res, next) => {
    const sessionId = req.params.sessionId;
    const port = sessionPortMap[sessionId];
    if (!port) return res.status(404).send('Session not found');
    return createProxyMiddleware({
      target: `http://127.0.0.1:${port}`,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        [`^/session/${sessionId}`]: '',
      },
    })(req, res, next);
  };
}

module.exports = {
  proxySession,
  registerSession,
  unregisterSession,
  sessionPortMap, // export for advanced use/testing
}; 