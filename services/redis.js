const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis is ready');
});

// Session management functions
async function registerSession(sessionId, sessionData) {
  try {
    // Defensive: ensure containerName and containerId are present
    if (!sessionData.containerName || !sessionData.containerId) {
      throw new Error('registerSession: containerName and containerId are required');
    }
    await redis.hset('active_sessions', sessionId, JSON.stringify(sessionData));
    console.log(`Session registered in Redis: ${sessionId} -> ${sessionData.containerName}`);
    return true;
  } catch (err) {
    console.error('Error registering session in Redis:', err);
    return false;
  }
}

async function unregisterSession(sessionId) {
  try {
    await redis.hdel('active_sessions', sessionId);
    console.log(`Session unregistered from Redis: ${sessionId}`);
    return true;
  } catch (err) {
    console.error('Error unregistering session from Redis:', err);
    return false;
  }
}

async function getSession(sessionId) {
  try {
    const sessionData = await redis.hget('active_sessions', sessionId);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (err) {
    console.error('Error getting session from Redis:', err);
    return null;
  }
}

async function getAllSessions() {
  try {
    const sessions = await redis.hgetall('active_sessions');
    const result = {};
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      result[sessionId] = JSON.parse(sessionData);
    }
    return result;
  } catch (err) {
    console.error('Error getting all sessions from Redis:', err);
    return {};
  }
}

async function updateSession(sessionId, updates) {
  try {
    const currentSession = await getSession(sessionId);
    if (!currentSession) {
      return false;
    }
    
    const updatedSession = { ...currentSession, ...updates };
    await redis.hset('active_sessions', sessionId, JSON.stringify(updatedSession));
    return true;
  } catch (err) {
    console.error('Error updating session in Redis:', err);
    return false;
  }
}

async function extendSession(sessionId, newExpiresAt) {
  return await updateSession(sessionId, { expires_at: newExpiresAt });
}

// Health check
async function healthCheck() {
  try {
    await redis.ping();
    return true;
  } catch (err) {
    console.error('Redis health check failed:', err);
    return false;
  }
}

module.exports = {
  redis,
  registerSession,
  unregisterSession,
  getSession,
  getAllSessions,
  updateSession,
  extendSession,
  healthCheck
}; 