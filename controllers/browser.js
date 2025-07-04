const docker = require('../services/docker');
const CHROMIUM_IMAGE = process.env.CHROMIUM_IMAGE;
const { registerSession, unregisterSession } = require('../utils/proxySession');

// Store timers for cleanup
const cleanupTimers = {};

exports.startSession = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  try {
    // Pull the image if not present
    await new Promise((resolve, reject) => {
      docker.pull(CHROMIUM_IMAGE, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });

    // Create the container
    const container = await docker.createContainer({
      Image: CHROMIUM_IMAGE,
      name: `chromium_${userId}_${Date.now()}`,
      Env: [
        'PUID=1000',
        'PGID=1000',
        'TZ=Etc/UTC'
      ],
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: '' }], // Let Docker assign a random port
          '3001/tcp': [{ HostPort: '' }]
        },
        SecurityOpt: ['seccomp=unconfined'],
        ShmSize: 1024 * 1024 * 1024 // 1GB
      }
    });

    await container.start();
    // Wait 1 second for Docker to finish port mapping
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = await container.inspect();
    const portBindings = data.NetworkSettings.Ports['3000/tcp'];
    if (!portBindings || !portBindings[0] || !portBindings[0].HostPort) {
      return res.status(500).json({ error: 'Chromium container did not expose a host port for 3000/tcp' });
    }
    const port = portBindings[0].HostPort;
    const sessionId = container.id;
    // Use PUBLIC_HOST env var for public-facing URL
    const PUBLIC_HOST = process.env.PUBLIC_HOST || 'localhost';
    // Register the session-port mapping for proxying
    registerSession(sessionId, port);
    // Return a proxied URL
    const baseUrl = `https://${PUBLIC_HOST}`;
    const guiUrl = `${baseUrl}/session/${sessionId}/`;
    const starting_time = new Date().toISOString();
    const expires_at = new Date(Date.now() + 300000).toISOString();

    // Set a timer to stop and remove the container after 5 minutes
    if (cleanupTimers[container.id]) {
      clearTimeout(cleanupTimers[container.id]);
    }
    const timer = setTimeout(async () => {
      try {
        const c = docker.getContainer(container.id);
        await c.stop().catch(() => {});
        await c.remove().catch(() => {});
        console.log(`Chromium container ${container.id} stopped and removed after 5 minutes.`);
      } catch (cleanupErr) {
        if (!cleanupErr.statusCode || cleanupErr.statusCode !== 404) {
          console.error(`Failed to clean up container ${container.id}:`, cleanupErr);
        }
      }
      delete cleanupTimers[container.id];
    }, 300000);
    timer.expires_at = expires_at;
    cleanupTimers[container.id] = timer;

    const expires_in = Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000);

    res.json({
      message: 'Session started',
      sessionId,
      userId,
      api_base_url: baseUrl,
      gui_url: guiUrl,
      containerId: container.id,
      starting_time,
      expires_in,
      container_port: port
    });
  } catch (err) {
    console.error('Error starting Chromium container:', err);
    res.status(500).json({ error: 'Failed to start Chromium session', details: err.message });
  }
};

exports.stopSession = async (req, res) => {
  const { containerId } = req.body;
  if (!containerId) {
    return res.status(400).json({ error: 'containerId is required' });
  }
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    unregisterSession(containerId);
    res.json({ message: 'Session stopped and container removed', containerId });
  } catch (err) {
    console.error('Error stopping/removing container:', err);
    res.status(500).json({ error: 'Failed to stop/remove container', details: err.message });
  }
};

exports.extendSession = (req, res) => {
  const { containerId, duration } = req.body;
  if (!containerId) {
    return res.status(400).json({ error: 'containerId is required' });
  }
  // Check if a cleanup timer exists for this container
  const timer = cleanupTimers[containerId];
  if (!timer) {
    return res.status(404).json({ error: 'No active session found for this containerId' });
  }
  // Use custom duration if provided, otherwise default to 5 minutes (300 seconds)
  const extendMs = (typeof duration === 'number' && duration > 0 ? duration : 300) * 1000;
  // Calculate the new expires_at by adding to the previous expires_at
  const prevExpiresAt = timer.expires_at ? new Date(timer.expires_at).getTime() : Date.now();
  const newExpiresAt = new Date(prevExpiresAt + extendMs).toISOString();
  // Reset the timer for the new total duration
  clearTimeout(cleanupTimers[containerId]);
  const msUntilNewExpires = new Date(newExpiresAt).getTime() - Date.now();
  const newTimer = setTimeout(async () => {
    try {
      const c = docker.getContainer(containerId);
      await c.stop().catch(() => {});
      await c.remove().catch(() => {});
      console.log(`Chromium container ${containerId} stopped and removed after extension.`);
    } catch (cleanupErr) {
      if (!cleanupErr.statusCode || cleanupErr.statusCode !== 404) {
        console.error(`Failed to clean up container ${containerId}:`, cleanupErr);
      }
    }
    delete cleanupTimers[containerId];
  }, msUntilNewExpires);
  newTimer.expires_at = newExpiresAt;
  cleanupTimers[containerId] = newTimer;
  res.json({ message: `Session extended by ${extendMs / 1000} seconds`, containerId, expires_at: newExpiresAt });
};

exports.getRemainingTime = (req, res) => {
  const containerId = req.query.containerId || req.body?.containerId;
  if (!containerId) {
    return res.status(400).json({ error: 'containerId is required' });
  }
  const timer = cleanupTimers[containerId];
  if (!timer) {
    return res.status(404).json({ error: 'No active session found for this containerId' });
  }
  // Node.js timers do not expose remaining time, so we need to track expires_at
  // We'll store expires_at on the timer object when we set it
  const expiresAt = timer.expires_at;
  if (!expiresAt) {
    return res.status(500).json({ error: 'Session expiration time not tracked' });
  }
  const now = Date.now();
  const remainingMs = new Date(expiresAt).getTime() - now;
  res.json({ containerId, remaining_seconds: Math.max(0, Math.floor(remainingMs / 1000)), expires_at: expiresAt });
};

exports.listActiveSessions = async (req, res) => {
  // List all active sessions (timers)
  const sessions = await Promise.all(
    Object.keys(cleanupTimers).map(async (containerId) => {
      let info = { containerId };
      // Try to get container info from Docker
      try {
        const container = docker.getContainer(containerId);
        const data = await container.inspect();
        // Find mapped port for url
        const portBindings = data.NetworkSettings.Ports['3000/tcp'];
        const PUBLIC_HOST = process.env.PUBLIC_HOST || 'localhost';
        const url = portBindings && portBindings[0] && portBindings[0].HostPort ? `http://${PUBLIC_HOST}:${portBindings[0].HostPort}` : undefined;
        info.url = url;
        info.state = data.State.Status;
        info.starting_time = data.State.StartedAt;
      } catch (e) {
        info.state = 'unknown';
      }
      // Timer info
      const timer = cleanupTimers[containerId];
      info.expires_at = timer.expires_at;
      info.expires_in = timer.expires_at ? Math.max(0, Math.floor((new Date(timer.expires_at).getTime() - Date.now()) / 1000)) : undefined;
      return info;
    })
  );
  res.json({ sessions });
}; 