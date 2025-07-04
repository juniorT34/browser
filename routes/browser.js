const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const browserController = require('../controllers/browser');

router.post('/start', auth, browserController.startSession);
router.post('/stop', auth, browserController.stopSession);
router.post('/extend', auth, browserController.extendSession);
router.get('/remaining_time', auth, browserController.getRemainingTime);
router.get('/admin/sessions', auth, browserController.listActiveSessions);

module.exports = router; 