const { createProxyMiddleware } = require('http-proxy-middleware');
const { getSession, registerSession: redisRegisterSession, unregisterSession: redisUnregisterSession, getAllSessions } = require('../services/redis');

const DOCKER_GATEWAY = process.env.DOCKER_GATEWAY || '172.17.0.1';

// In-memory sessionId -> port mapping (cache)
const sessionPortMap = {};

async function registerSession(sessionId, port) {
  sessionPortMap[sessionId] = port;
  await redisRegisterSession(sessionId, { port });
  console.log(`Session registered: ${sessionId} -> port ${port}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

async function unregisterSession(sessionId) {
  delete sessionPortMap[sessionId];
  await redisUnregisterSession(sessionId);
  console.log(`Session unregistered: ${sessionId}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

// Middleware to proxy /session/:sessionId/* to the correct local port
function proxySession() {
  return createProxyMiddleware({
    target: 'https://127.0.0.1', // dummy, will be rewritten dynamically
    changeOrigin: true,
    ws: true,
    secure: false, // allow self-signed certs from Chromium containers
    router: async function (req) {
      const sessionId = req.params.sessionId;
      let containerName = sessionPortMap[sessionId];
      if (!containerName) {
        // Try Redis
        const session = await getSession(sessionId);
        if (session && session.port) {
          containerName = session.port;
          sessionPortMap[sessionId] = containerName; // cache for future
        }
      }
      if (!containerName) {
        return null;
      }
      return `https://${containerName}:3001`;
    },
    pathRewrite: function (path, req) {
      const rewrittenPath = path.replace(/^\/session\/[^\/]+/, '');
      return rewrittenPath;
    },
    onProxyReq: async function (proxyReq, req, res) {
      const sessionId = req.params.sessionId;
      let containerName = sessionPortMap[sessionId];
      if (!containerName) {
        const session = await getSession(sessionId);
        if (session && session.port) {
          containerName = session.port;
          sessionPortMap[sessionId] = containerName;
        }
      }
      if (!containerName) {
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
    },
    onError: function (err, req, res) {
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

async function listActiveSessions() {
  const sessions = await getAllSessions();
  return Object.keys(sessions).map(sessionId => ({
    sessionId,
    port: sessions[sessionId].port
  }));
}

module.exports = {
  proxySession,
  registerSession,
  unregisterSession,
  sessionPortMap, // export for advanced use/testing
  listActiveSessions
}; 