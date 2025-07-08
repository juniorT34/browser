const { getAllSessions } = require('../services/redis');

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

exports.getSessionDetail = (req, res) => {
  // TODO: Implement get session detail
  res.json({ message: 'TODO: Get session detail', sessionId: req.params.id });
};

exports.stopSession = (req, res) => {
  // TODO: Implement force-stop session
  res.json({ message: 'TODO: Force-stop session', sessionId: req.params.id });
};

exports.extendSession = (req, res) => {
  // TODO: Implement extend session
  res.json({ message: 'TODO: Extend session', sessionId: req.params.id });
};

exports.getSessionLogs = (req, res) => {
  // TODO: Implement view session logs
  res.json({ message: 'TODO: View session logs', sessionId: req.params.id });
};

exports.listAllUsers = (req, res) => {
  // TODO: Implement list all users
  res.json({ message: 'TODO: List all users' });
};

exports.listUserSessions = (req, res) => {
  // TODO: Implement list sessions for user
  res.json({ message: 'TODO: List sessions for user', userId: req.params.userId });
};

exports.getAuditLogs = (req, res) => {
  // TODO: Implement view audit logs
  res.json({ message: 'TODO: View audit logs' });
};

exports.getMetrics = (req, res) => {
  // TODO: Implement real-time metrics
  res.json({ message: 'TODO: Get real-time metrics' });
};

exports.listAllContainers = (req, res) => {
  // TODO: Implement list all containers
  res.json({ message: 'TODO: List all containers' });
};

exports.healthCheck = (req, res) => {
  // TODO: Implement system health check
  res.json({ message: 'TODO: System health check' });
}; 