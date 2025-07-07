const { createProxyMiddleware } = require('http-proxy-middleware');
const { getSession, registerSession: redisRegisterSession, unregisterSession: redisUnregisterSession, getAllSessions } = require('../services/redis');

const DOCKER_GATEWAY = process.env.DOCKER_GATEWAY || '172.17.0.1';

// In-memory sessionId -> containerName mapping (cache)
const sessionPortMap = {};

// Register session with containerName and containerId (support both old and new signatures)
async function registerSession(sessionId, containerNameOrObj, containerId) {
  let sessionData;
  if (typeof containerNameOrObj === 'object' && containerNameOrObj !== null) {
    // New style: registerSession(sessionId, { containerName, containerId, containerIp })
    sessionPortMap[sessionId] = containerNameOrObj;
    sessionData = containerNameOrObj;
  } else {
    // Old style: registerSession(sessionId, containerName, containerId)
    sessionPortMap[sessionId] = { containerName: containerNameOrObj, containerId };
    sessionData = { containerName: containerNameOrObj, containerId };
  }
  await redisRegisterSession(sessionId, sessionData);
  console.log(`Session registered: ${sessionId} -> containerName ${sessionData.containerName}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

async function unregisterSession(sessionId) {
  delete sessionPortMap[sessionId];
  await redisUnregisterSession(sessionId);
  console.log(`Session unregistered: ${sessionId}`);
  console.log('Current sessions:', Object.keys(sessionPortMap));
}

function extractSessionId(req) {
  // Try Express params first
  if (req.params && req.params.sessionId) return req.params.sessionId;
  // Fallback: extract from URL (for WebSocket upgrades)
  const match = req.url && req.url.match(/^\/session\/([^\/]+)/);
  if (match) return match[1];
  // Fallback: extract from path (if mounted at /session/:sessionId)
  const wsMatch = req.url && req.url.match(/^\/([^\/]+)\//);
  if (wsMatch) return wsMatch[1];
  return null;
}

// Middleware to proxy /session/:sessionId/* to the correct container by name
function proxySession() {
  return createProxyMiddleware({
    target: 'https://127.0.0.1', // dummy, will be rewritten dynamically
    changeOrigin: true,
    ws: true,
    secure: false, // allow self-signed certs from Chromium containers
    router: async function (req, res) {
      // Extra debug logging
      console.log('==================== PROXY SESSION REQUEST ====================');
      console.log('Date:', new Date().toISOString());
      console.log('req.method:', req.method);
      console.log('req.url:', req.url);
      console.log('req.originalUrl:', req.originalUrl);
      console.log('req.baseUrl:', req.baseUrl);
      console.log('req.path:', req.path);
      console.log('req.headers:', req.headers);
      if (req.connection && req.connection.remoteAddress) {
        console.log('Remote address:', req.connection.remoteAddress);
      }
      if (req.headers['upgrade']) {
        console.log('WebSocket upgrade requested:', req.headers['upgrade']);
      }
      const sessionId = extractSessionId(req);
      console.log('Extracted sessionId:', sessionId);
      if (!sessionId) {
        console.warn('No sessionId found in request');
        if (res && typeof res.writeHead === 'function') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session ID not found in request' }));
        }
        return '';
      }
      console.log('sessionPortMap:', sessionPortMap);
      let containerName, containerIp;
      const mapEntry = sessionPortMap[sessionId];
      if (typeof mapEntry === 'string') {
        containerName = mapEntry;
      } else if (mapEntry && typeof mapEntry === 'object') {
        containerName = mapEntry.containerName;
        containerIp = mapEntry.containerIp;
      }
      if (!containerName) {
        const session = await getSession(sessionId);
        if (session && session.containerName) {
          containerName = session.containerName;
          containerIp = session.containerIp;
          // Always update cache in new format
          sessionPortMap[sessionId] = { containerName, containerId: sessionId, containerIp };
        }
      }
      console.log('containerName:', containerName);
      console.log('containerIp:', containerIp);
      if (!containerIp) {
        console.warn('No containerIp found for sessionId:', sessionId);
        if (res && typeof res.writeHead === 'function') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found or expired' }));
        }
        return '';
      }
      const targetUrl = `https://${containerIp}:3001`;
      console.log('Proxy target URL:', targetUrl);
      console.log('================== END PROXY SESSION REQUEST ==================');
      return targetUrl;
    },
    pathRewrite: function (path, req) {
      // Remove /session/:sessionId from the path
      return path.replace(/^\/session\/[^\/]+/, '');
    },
    onError: function (err, req, res) {
      if (res && typeof res.setHeader === 'function') {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Proxy error',
          message: 'Failed to connect to session container',
          details: err.message
        }));
      } else if (res && typeof res.writeHead === 'function') {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Proxy error',
          message: 'Failed to connect to session container',
          details: err.message
        }));
      } else if (res && typeof res.end === 'function') {
        res.end(JSON.stringify({
          error: 'Proxy error',
          message: 'Failed to connect to session container',
          details: err.message
        }));
      }
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