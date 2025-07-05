require('dotenv').config();
const Docker = require('dockerode');
const Redis = require('ioredis');

const docker = new Docker();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const CLEANUP_INTERVAL = parseInt(process.env.CLEANUP_INTERVAL) || 60000; // 1 minute
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 300; // 5 minutes

console.log(`Cleanup worker started with interval: ${CLEANUP_INTERVAL}ms, session timeout: ${SESSION_TIMEOUT}s`);

async function cleanupExpiredSessions() {
  try {
    console.log('Checking for expired sessions...');
    
    // Get all active sessions from Redis
    const sessions = await redis.hgetall('active_sessions');
    
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      try {
        const session = JSON.parse(sessionData);
        const expiresAt = new Date(session.expires_at);
        const now = new Date();
        
        if (now > expiresAt) {
          console.log(`Session ${sessionId} expired, cleaning up...`);
          
          // Stop and remove the container
          try {
            const container = docker.getContainer(sessionId);
            await container.stop();
            await container.remove();
            console.log(`Container ${sessionId} stopped and removed`);
          } catch (err) {
            if (err.statusCode === 404) {
              console.log(`Container ${sessionId} already removed`);
            } else {
              console.error(`Error cleaning up container ${sessionId}:`, err.message);
            }
          }
          
          // Remove from Redis
          await redis.hdel('active_sessions', sessionId);
          console.log(`Session ${sessionId} removed from Redis`);
        }
      } catch (err) {
        console.error(`Error processing session ${sessionId}:`, err.message);
        // Remove invalid session data
        await redis.hdel('active_sessions', sessionId);
      }
    }
    
    // Also check for orphaned containers
    const containers = await docker.listContainers({ all: true });
    for (const container of containers) {
      if (container.Names.some(name => name.includes('chromium_')) && 
          container.State === 'exited') {
        try {
          const containerInstance = docker.getContainer(container.Id);
          await containerInstance.remove();
          console.log(`Removed orphaned container: ${container.Id}`);
        } catch (err) {
          console.error(`Error removing orphaned container ${container.Id}:`, err.message);
        }
      }
    }
    
  } catch (err) {
    console.error('Error in cleanup process:', err);
  }
}

// Run cleanup immediately on startup
cleanupExpiredSessions();

// Schedule periodic cleanup
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Cleanup worker shutting down...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Cleanup worker shutting down...');
  await redis.quit();
  process.exit(0);
}); 