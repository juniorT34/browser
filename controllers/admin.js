const fs = require('fs');
const os = require('os');
const path = require('path');
const { getAllSessions, getSession, unregisterSession, extendSession: redisExtendSession, healthCheck: redisHealthCheck } = require('../services/redis');
const docker = require('../services/docker');
const { sessionPortMap } = require('../utils/proxySession');

// Admin controller stubs for all admin endpoints
// Each function should log the admin action for audit

exports.listAllSessions = async (req, res) => {
  try {
    const now = Date.now();
    const sessions = await getAllSessions();
    // Audit log: admin user, action, timestamp
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} listed all sessions at ${new Date().toISOString()}`);
    // Return all session info, sorted by starting_time desc
    const sessionList = Object.entries(sessions).map(([sessionId, data]) => {
      let expires_in = null;
      if (data.expires_at) {
        expires_in = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - now) / 1000));
      }
      return {
        sessionId,
        containerName: data.containerName,
        containerId: data.containerId,
        containerIp: data.containerIp,
        userId: data.userId,
        gui_url: data.gui_url,
        starting_time: data.starting_time,
        expires_at: data.expires_at,
        expires_in
      };
    }).sort((a, b) => (b.starting_time || '').localeCompare(a.starting_time || ''));
    res.json({ sessions: sessionList });
  } catch (err) {
    console.error('Error listing all sessions:', err);
    res.status(500).json({ error: 'Failed to list sessions', details: err.message });
  }
};

exports.getSessionDetail = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Try to get Docker container info
    let containerInfo = null;
    try {
      const container = docker.getContainer(sessionId);
      containerInfo = await container.inspect();
    } catch (e) {
      containerInfo = { error: 'Container not found or not running' };
    }
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} viewed session ${sessionId} at ${new Date().toISOString()}`);
    res.json({ sessionId, ...session, containerInfo });
  } catch (err) {
    console.error('Error getting session detail:', err);
    res.status(500).json({ error: 'Failed to get session detail', details: err.message });
  }
};

exports.stopSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    // Try to stop and remove the container
    try {
      const container = docker.getContainer(sessionId);
      await container.stop().catch(() => {});
      await container.remove().catch(() => {});
    } catch (e) {
      // Ignore if already gone
    }
    await unregisterSession(sessionId);
    delete sessionPortMap[sessionId];
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} force-stopped session ${sessionId} at ${new Date().toISOString()}`);
    res.json({ message: 'Session stopped and removed', sessionId });
  } catch (err) {
    console.error('Error force-stopping session:', err);
    res.status(500).json({ error: 'Failed to stop session', details: err.message });
  }
};

exports.extendSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { duration } = req.body;
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Default to 5 minutes if not specified
    const extendMs = (typeof duration === 'number' && duration > 0 ? duration : 300) * 1000;
    const prevExpiresAt = session.expires_at ? new Date(session.expires_at).getTime() : Date.now();
    const newExpiresAt = new Date(prevExpiresAt + extendMs).toISOString();
    await redisExtendSession(sessionId, newExpiresAt);
    // Optionally, reset in-memory timer if you have one
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} extended session ${sessionId} to ${newExpiresAt} at ${new Date().toISOString()}`);
    res.json({ message: `Session extended`, sessionId, expires_at: newExpiresAt });
  } catch (err) {
    console.error('Error extending session:', err);
    res.status(500).json({ error: 'Failed to extend session', details: err.message });
  }
};

exports.getSessionLogs = async (req, res) => {
  try {
    const sessionId = req.params.id;
    // Try to get Docker logs
    let logs = '';
    try {
      const container = docker.getContainer(sessionId);
      logs = await container.logs({ stdout: true, stderr: true, tail: 500, timestamps: true });
      if (Buffer.isBuffer(logs)) logs = logs.toString();
    } catch (e) {
      logs = 'Container not found or logs unavailable.';
    }
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} viewed logs for session ${sessionId} at ${new Date().toISOString()}`);
    res.type('text/plain').send(logs);
  } catch (err) {
    console.error('Error getting session logs:', err);
    res.status(500).json({ error: 'Failed to get session logs', details: err.message });
  }
};

exports.listAllUsers = async (req, res) => {
  try {
    const sessions = await getAllSessions();
    const userMap = {};
    for (const [sessionId, data] of Object.entries(sessions)) {
      if (!data.userId) continue;
      if (!userMap[data.userId]) userMap[data.userId] = [];
      userMap[data.userId].push({ sessionId, ...data });
    }
    const users = Object.entries(userMap).map(([userId, sessions]) => ({ userId, sessionCount: sessions.length, sessions }));
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} listed all users at ${new Date().toISOString()}`);
    res.json({ users });
  } catch (err) {
    console.error('Error listing all users:', err);
    res.status(500).json({ error: 'Failed to list users', details: err.message });
  }
};

exports.listUserSessions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessions = await getAllSessions();
    const userSessions = Object.entries(sessions)
      .filter(([_, data]) => data.userId === userId)
      .map(([sessionId, data]) => ({ sessionId, ...data }));
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} listed sessions for user ${userId} at ${new Date().toISOString()}`);
    res.json({ userId, sessions: userSessions });
  } catch (err) {
    console.error('Error listing user sessions:', err);
    res.status(500).json({ error: 'Failed to list user sessions', details: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    // Read last 200 lines from logs/app.log if exists
    const logPath = path.join(__dirname, '../logs/app.log');
    let lines = [];
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf-8');
      lines = data.trim().split(/\r?\n/).slice(-200);
    } else {
      lines = ['Audit log file not found.'];
    }
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} viewed audit logs at ${new Date().toISOString()}`);
    res.json({ logs: lines });
  } catch (err) {
    console.error('Error getting audit logs:', err);
    res.status(500).json({ error: 'Failed to get audit logs', details: err.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const sessions = await getAllSessions();
    const userIds = new Set();
    for (const data of Object.values(sessions)) {
      if (data.userId) userIds.add(data.userId);
    }
    // Docker container count
    let containerCount = 0;
    try {
      const containers = await docker.listContainers({ all: false });
      containerCount = containers.length;
    } catch (e) {}
    // System stats
    const mem = process.memoryUsage();
    const load = os.loadavg();
    const uptime = os.uptime();
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} viewed metrics at ${new Date().toISOString()}`);
    res.json({
      activeSessionCount: Object.keys(sessions).length,
      userCount: userIds.size,
      containerCount,
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      },
      loadavg: load,
      uptime
    });
  } catch (err) {
    console.error('Error getting metrics:', err);
    res.status(500).json({ error: 'Failed to get metrics', details: err.message });
  }
};

exports.listAllContainers = async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const result = containers.map(c => ({
      id: c.Id,
      names: c.Names,
      image: c.Image,
      state: c.State,
      status: c.Status,
      created: c.Created,
      ports: c.Ports
    }));
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} listed all containers at ${new Date().toISOString()}`);
    res.json({ containers: result });
  } catch (err) {
    console.error('Error listing containers:', err);
    res.status(500).json({ error: 'Failed to list containers', details: err.message });
  }
};

exports.healthCheck = async (req, res) => {
  try {
    // Check Redis
    let redisOk = false;
    try {
      redisOk = await redisHealthCheck();
    } catch (e) {}
    // Check Docker
    let dockerOk = false;
    try {
      await docker.ping();
      dockerOk = true;
    } catch (e) {}
    // System
    const uptime = os.uptime();
    const load = os.loadavg();
    const mem = process.memoryUsage();
    const status = redisOk && dockerOk ? 'ok' : 'degraded';
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} checked system health at ${new Date().toISOString()}`);
    res.json({
      status,
      redis: redisOk,
      docker: dockerOk,
      uptime,
      loadavg: load,
      memory: mem
    });
  } catch (err) {
    console.error('Error in health check:', err);
    res.status(500).json({ error: 'Failed to check health', details: err.message });
  }
};

exports.execInSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { cmd } = req.body;
    if (!Array.isArray(cmd) || !cmd.length) {
      return res.status(400).json({ error: 'cmd (array of strings) is required' });
    }
    // SECURITY WARNING: This is dangerous. Only allow for trusted admins.
    let output = '';
    try {
      const container = docker.getContainer(sessionId);
      const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false
      });
      const stream = await exec.start({ hijack: true, stdin: false });
      output = await new Promise((resolve, reject) => {
        let result = '';
        stream.on('data', chunk => { result += chunk.toString(); });
        stream.on('end', () => resolve(result));
        stream.on('error', reject);
      });
    } catch (e) {
      output = `Error: ${e.message}`;
    }
    console.log(`[AUDIT] Admin ${req.user?.id || 'unknown'} exec in session ${sessionId} cmd: ${JSON.stringify(cmd)} at ${new Date().toISOString()}`);
    res.type('text/plain').send(output);
  } catch (err) {
    console.error('Error exec in session:', err);
    res.status(500).json({ error: 'Failed to exec in session', details: err.message });
  }
}; 