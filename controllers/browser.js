const docker = require('../services/docker');
const PUBLIC_HOST = process.env.PUBLIC_HOST || 'localhost';
const CHROMIUM_IMAGE = process.env.CHROMIUM_IMAGE || 'kasmweb/chromium:1.15.0-rolling';
const { registerSession, unregisterSession } = require('../utils/proxySession');
const net = require('net');

// Store timers for cleanup
const cleanupTimers = {};

// On startup, scan for running Chromium containers and re-register them
(async function recoverOrphanedSessions() {
  try {
    const containers = await docker.listContainers({ all: false });
    for (const c of containers) {
      if (c.Names.some(name => name.includes('chromium_'))) {
        const containerName = c.Names[0].replace(/^\//, '');
        const sessionId = c.Id;
        // Fetch container IP
        const data = await docker.getContainer(sessionId).inspect();
        const containerIp = data.NetworkSettings.Networks && data.NetworkSettings.Networks['browser_network']
          ? data.NetworkSettings.Networks['browser_network'].IPAddress
          : null;
        await registerSession(sessionId, { containerName, containerId: sessionId, containerIp });
        console.log(`[Startup] Recovered orphaned session: ${sessionId} -> ${containerName} (IP: ${containerIp})`);
      }
    }
  } catch (err) {
    console.error('[Startup] Error recovering orphaned sessions:', err);
  }
})();

exports.startSession = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  console.log(`Starting Chromium session for user: ${userId} with image: ${CHROMIUM_IMAGE}`);
  
  try {
    // Check if image exists locally first
    let imageExists = false;
    try {
      const images = await docker.listImages();
      imageExists = images.some(img => 
        img.RepoTags && img.RepoTags.some(tag => tag === CHROMIUM_IMAGE)
      );
    } catch (err) {
      console.warn('Could not check local images:', err.message);
    }

    // Only pull if image doesn't exist locally
    if (!imageExists) {
      console.log(`Image ${CHROMIUM_IMAGE} not found locally, pulling...`);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Docker pull timeout after 60 seconds'));
        }, 60000);
        
        docker.pull(CHROMIUM_IMAGE, (err, stream) => {
          if (err) {
            clearTimeout(timeout);
            return reject(err);
          }
          docker.modem.followProgress(stream, (err, output) => {
            clearTimeout(timeout);
            if (err) return reject(err);
            console.log('Image pull completed');
            resolve(output);
          });
        });
      });
    } else {
      console.log(`Using local image: ${CHROMIUM_IMAGE}`);
    }

    // Create the container with timeout
    console.log('Creating container...');
    const containerName = `chromium_${userId}_${Date.now()}`;
    const container = await Promise.race([
      docker.createContainer({
        Image: CHROMIUM_IMAGE,
        name: containerName,
        Env: [
          'PUID=1000',
          'PGID=1000',
          'TZ=Etc/UTC'
        ],
        ExposedPorts: {
          '3001/tcp': {}
        },
        HostConfig: {
          NetworkMode: 'browser_network',
          SecurityOpt: ['seccomp=unconfined'],
          ShmSize: 1024 * 1024 * 1024, // 1GB
          PortBindings: {
            '3001/tcp': [{ HostPort: '', HostIP: '0.0.0.0' }]
          }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Container creation timeout after 30 seconds')), 30000)
      )
    ]);

    console.log(`Container created: ${container.id}`);
    
    // Start the container with timeout
    console.log('Starting container...');
    await Promise.race([
      container.start(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Container start timeout after 60 seconds')), 60000)
      )
    ]);
    
    console.log('Container started successfully');
    
    // Wait for container to be ready (poll port 3001 for up to 15 seconds)
    const maxWait = 15000;
    const interval = 500;
    let ready = false;
    let waited = 0;
    const data = await container.inspect();
    const containerIp = data.NetworkSettings.Networks && data.NetworkSettings.Networks['browser_network'] ? data.NetworkSettings.Networks['browser_network'].IPAddress : null;
    if (!containerIp) {
      return res.status(500).json({ error: 'Could not determine container IP on browser_network' });
    }
    while (waited < maxWait) {
      try {
        await new Promise((resolve, reject) => {
          const socket = net.connect({ host: containerIp, port: 3001 }, () => {
            socket.end();
            resolve();
          });
          socket.on('error', reject);
          setTimeout(() => {
            socket.destroy();
            reject(new Error('Timeout'));
          }, 1000);
        });
        ready = true;
        break;
      } catch (e) {
        await new Promise(r => setTimeout(r, interval));
        waited += interval;
      }
    }
    if (!ready) {
      // Clean up container if not ready
      try { await container.stop(); } catch {}
      try { await container.remove(); } catch {}
      return res.status(500).json({ error: 'Chromium container did not become ready in time' });
    }
    
    // Wait for container to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sessionId = container.id;
    let directHttpsUrl = null;
    let publishedPort = null;
    if (data.NetworkSettings.Ports && data.NetworkSettings.Ports['3001/tcp'] && data.NetworkSettings.Ports['3001/tcp'][0]) {
      publishedPort = data.NetworkSettings.Ports['3001/tcp'][0].HostPort;
      directHttpsUrl = `https://${PUBLIC_HOST}:${publishedPort}`;
    }
    console.log(`Container ${sessionId} started with name ${containerName} and IP ${containerIp}`);
    
    // Use PUBLIC_HOST env var for public-facing URL
    // Return both proxied and direct URLs for testing
    const baseUrl = `https://${PUBLIC_HOST}`;
    const guiUrl = `${baseUrl}/session/${sessionId}/`;
    const starting_time = new Date().toISOString();
    const expires_at = new Date(Date.now() + 300000).toISOString();

    // Register the session with the container name (preferred for DNS resolution)
    console.log(`Registering session: ${sessionId} -> container name ${containerName}`);
    await registerSession(sessionId, {
      containerName,
      containerId: sessionId,
      containerIp,
      userId,
      gui_url: guiUrl,
      starting_time,
      expires_at
    });

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

    console.log(`Session started successfully: ${sessionId} -> ${guiUrl}`);

    res.json({
      message: 'Session started',
      sessionId,
      userId,
      api_base_url: baseUrl,
      gui_url: guiUrl,
      direct_https_url: directHttpsUrl,
      containerId: container.id,
      containerName,
      containerIp,
      publishedPort,
      starting_time,
      expires_in,
      usage_notes: {
        recommended: "Use gui_url for secure access via reverse proxy (no browser warnings)",
        direct: "Direct access is for debugging only and will show a browser privacy warning."
      }
    });
  } catch (err) {
    console.error('Error starting Chromium container:', err);
    res.status(500).json({ 
      error: 'Failed to start Chromium session', 
      details: err.message,
      image: CHROMIUM_IMAGE
    });
  }
};

// Restore missing exports for browser routes
exports.stopSession = async (req, res) => {
  const { containerId } = req.body;
  if (!containerId) {
    return res.status(400).json({ error: 'containerId is required' });
  }
  try {
    try {
      const container = docker.getContainer(containerId);
      await container.stop();
      await container.remove();
    } catch (err) {
      // If the container is already gone, log and continue
      if (err.statusCode !== 404) {
        console.error('Error stopping/removing container:', err);
        return res.status(500).json({ error: 'Failed to stop/remove container', details: err.message });
      }
    }
    await unregisterSession(containerId);
    if (cleanupTimers[containerId]) {
      clearTimeout(cleanupTimers[containerId]);
      delete cleanupTimers[containerId];
    }
    res.json({ message: 'Session stopped and container removed', containerId });
  } catch (err) {
    console.error('Error in stopSession:', err);
    res.status(500).json({ error: 'Failed to stop/remove session', details: err.message });
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
  const sessions = [];
  for (const containerId of Object.keys(cleanupTimers)) {
    let info = { containerId };
    let isRunning = false;
    try {
      const container = docker.getContainer(containerId);
      const data = await container.inspect();
      if (data.State.Status === 'running') {
        isRunning = true;
        // Find mapped port for url
        const portBindings = data.NetworkSettings.Ports['6900/tcp'];
        const url = portBindings && portBindings[0] && portBindings[0].HostPort ? `http://${PUBLIC_HOST}:${portBindings[0].HostPort}` : undefined;
        info.url = url;
        info.state = data.State.Status;
        info.starting_time = data.State.StartedAt;
      }
    } catch (e) {
      // Container not found or not running
    }
    // Timer info
    const timer = cleanupTimers[containerId];
    info.expires_at = timer.expires_at;
    info.expires_in = timer.expires_at ? Math.max(0, Math.floor((new Date(timer.expires_at).getTime() - Date.now()) / 1000)) : undefined;

    if (isRunning) {
      sessions.push(info);
    } else {
      // Clean up timer for non-running container
      clearTimeout(cleanupTimers[containerId]);
      delete cleanupTimers[containerId];
      await unregisterSession(containerId);
    }
  }
  res.json({ sessions });
};