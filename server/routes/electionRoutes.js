const express = require('express');
const router = express.Router();
const { getPublicElections, getElectionById } = require('../controllers/electionController');

router.get('/', getPublicElections);
router.get('/:id', getElectionById);

module.exports = router;
