const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { admin } = require('../middlewares/auth');
const adminController = require('../controllers/admin');

// All routes require JWT and admin role
router.use(auth, admin);

// Session management
router.get('/sessions', adminController.listAllSessions); // List all active sessions
router.get('/session/:id', adminController.getSessionDetail); // Get session detail
router.post('/session/:id/stop', adminController.stopSession); // Force-stop session
router.post('/session/:id/extend', adminController.extendSession); // Extend session
router.post('/session/:id/exec', adminController.execInSession); // Exec command in session
router.get('/session/:id/logs', adminController.getSessionLogs); // View session logs

// User activity
router.get('/users', adminController.listAllUsers); // List all users
router.get('/user/:userId/sessions', adminController.listUserSessions); // List sessions for user

// Audit logs
router.get('/audit/logs', adminController.getAuditLogs); // View audit logs

// Metrics & containers
router.get('/metrics', adminController.getMetrics); // Real-time metrics
router.get('/containers', adminController.listAllContainers); // List all containers

// Health
router.get('/health', adminController.healthCheck); // System health

module.exports = router; 