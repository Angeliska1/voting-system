const express = require('express');
const router = express.Router();
const {
  createElection, getElections, updateElection, deleteElection,
  addCandidate, getCandidates, updateCandidate, deleteCandidate,
  getVoters, getAuditLogs, getDashboardStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/voters', getVoters);
router.get('/audit-logs', getAuditLogs);

router.route('/elections').get(getElections).post(createElection);
router.route('/elections/:id').put(updateElection).delete(deleteElection);

router.post('/candidates', addCandidate);
router.get('/candidates/:electionId', getCandidates);
router.route('/candidates/:id').put(updateCandidate).delete(deleteCandidate);

module.exports = router;
