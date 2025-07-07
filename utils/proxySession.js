const { createProxyMiddleware } = require('http-proxy-middleware');
const { getSession, registerSession: redisRegisterSession, unregisterSession: redisUnregisterSession, getAllSessions } = require('../services/redis');

const DOCKER_GATEWAY = process.env.DOCKER_GATEWAY || '172.17.0.1';

// In-memory sessionId -> containerName mapping (cache)
const sessionPortMap = {};

// Register session with containerName and containerId
async function registerSession(sessionId, containerName, containerId) {
  sessionPortMap[sessionId] = containerName;
  await redisRegisterSession(sessionId, { containerName, containerId });
  console.log(`Session registered: ${sessionId} -> containerName ${containerName}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

async function unregisterSession(sessionId) {
  delete sessionPortMap[sessionId];
  await redisUnregisterSession(sessionId);
  console.log(`Session unregistered: ${sessionId}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

// Middleware to proxy /session/:sessionId/* to the correct container by name
function proxySession() {
  return createProxyMiddleware({
    target: 'https://127.0.0.1', // dummy, will be rewritten dynamically
    changeOrigin: true,
    ws: true,
    secure: false, // allow self-signed certs from Chromium containers
    router: async function (req) {
      const sessionId = req.params && req.params.sessionId;
      if (!sessionId) {
        return null;
      }
      let containerName = sessionPortMap[sessionId];
      if (!containerName) {
        // Try Redis
        const session = await getSession(sessionId);
        if (session && session.containerName) {
          containerName = session.containerName;
          sessionPortMap[sessionId] = containerName; // cache for future
        }
      }
      if (!containerName) {
        console.error(`[Proxy] No containerName found for sessionId ${sessionId}. sessionPortMap:`, sessionPortMap);
        return null;
      }
      return `https://${containerName}:3001`;
    },
    pathRewrite: function (path, req) {
      const rewrittenPath = path.replace(/^\/session\/[^\/]+/, '');
      return rewrittenPath;
    },
    onProxyReq: async function (proxyReq, req, res) {
      const sessionId = req.params && req.params.sessionId;
      if (!sessionId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Bad request',
          message: 'Missing sessionId in request parameters'
        }));
        return;
      }
      let containerName = sessionPortMap[sessionId];
      if (!containerName) {
        const session = await getSession(sessionId);
        if (session && session.containerName) {
          containerName = session.containerName;
          sessionPortMap[sessionId] = containerName;
        }
      }
      if (!containerName) {
        // Diagnostics: log all running containers and their names
        const Docker = require('dockerode');
        const docker = new Docker();
        let containers = [];
        try {
          containers = await docker.listContainers({ all: true });
        } catch (e) {
          console.error('[Proxy] Could not list Docker containers:', e);
        }
        const containerNames = containers.map(c => c.Names[0]);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Session not found',
          sessionId: sessionId,
          availableSessions: Object.keys(sessionPortMap),
          dockerContainers: containerNames,
          message: 'The session may have expired, never existed, or the container is not ready. Please start a new session.'
        }));
        return;
      }
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

async function listActiveSessions() {
  const sessions = await getAllSessions();
  return Object.keys(sessions).map(sessionId => ({
    sessionId,
    containerName: sessions[sessionId].containerName,
    containerId: sessions[sessionId].containerId
  }));
}

module.exports = {
  proxySession,
  registerSession,
  unregisterSession,
  sessionPortMap, // export for advanced use/testing
  listActiveSessions
}; 