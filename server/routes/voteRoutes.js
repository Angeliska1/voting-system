const express = require('express');
const router = express.Router();
const { castVote, getResults, checkVoteStatus, verifyElectionChain } = require('../controllers/voteController');
const { protect, verifiedOnly, adminOnly } = require('../middleware/auth');
const { voteLimiter } = require('../middleware/rateLimiter');

router.post('/cast', protect, verifiedOnly, voteLimiter, castVote);
router.get('/results/:electionId', getResults);
router.get('/check/:electionId', protect, checkVoteStatus);
router.get('/verify/:electionId', protect, adminOnly, verifyElectionChain);

module.exports = router;
