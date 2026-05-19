const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { addVoteBlock, verifyChain } = require('../utils/blockchain');

// @route  POST /api/votes/cast
exports.castVote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { electionId, votes } = req.body;

    const election = await Election.findById(electionId).session(session);
    if (!election) { await session.abortTransaction(); return res.status(404).json({ success: false, message: 'Election not found.' }); }
    if (election.status !== 'active') { await session.abortTransaction(); return res.status(400).json({ success: false, message: 'This election is not currently active.' }); }

    const voter = await User.findById(req.user.id).session(session);
    if (voter.votedElections.includes(electionId)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'You have already voted in this election.' });
    }

    // Validate each vote
    const voteDocs = [];
    for (const v of votes) {
      const candidate = await Candidate.findById(v.candidateId).session(session);
      if (!candidate || candidate.election.toString() !== electionId) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `Invalid candidate for position: ${v.position}` });
      }
      if (candidate.position !== v.position) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Candidate does not match position.' });
      }
      voteDocs.push({ voter: req.user.id, election: electionId, candidate: v.candidateId, position: v.position });
    }

    // Insert all votes atomically
    await Vote.insertMany(voteDocs, { session });

    // Increment each candidate's vote count
    for (const v of votes) {
      await Candidate.findByIdAndUpdate(v.candidateId, { $inc: { voteCount: 1 } }, { session });
    }

    // Mark voter and update election total
    voter.votedElections.push(electionId);
    await voter.save({ session });
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotesCast: 1 } }, { session });

    await session.commitTransaction();

    // Add a block to the chain for each vote (outside transaction — blockchain is append-only)
    for (const v of votes) {
      await addVoteBlock(electionId, req.user.id, v.candidateId, v.position);
    }

    await AuditLog.create({
      action: 'VOTE_CAST',
      performedBy: req.user.id,
      details: `Vote cast in election: ${election.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Your vote has been recorded and secured on the blockchain. Thank you for participating!' });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate vote detected.' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while casting vote.' });
  } finally {
    session.endSession();
  }
};

// @route  GET /api/votes/results/:electionId
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });

    const candidates = await Candidate.find({ election: req.params.electionId }).sort({ position: 1, voteCount: -1 });

    const resultsByPosition = {};
    for (const c of candidates) {
      if (!resultsByPosition[c.position]) resultsByPosition[c.position] = [];
      resultsByPosition[c.position].push({
        _id: c._id, fullName: c.fullName, party: c.party, image: c.image, voteCount: c.voteCount,
      });
    }

    // Include blockchain integrity status
    const chainStatus = await verifyChain(req.params.electionId);

    res.json({
      success: true,
      election: {
        _id: election._id, title: election.title, status: election.status,
        totalVotesCast: election.totalVotesCast, endDate: election.endDate,
      },
      results: resultsByPosition,
      blockchain: chainStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching results.' });
  }
};

// @route  GET /api/votes/check/:electionId
exports.checkVoteStatus = async (req, res) => {
  try {
    const voter = await User.findById(req.user.id);
    const hasVoted = voter.votedElections.map(id => id.toString()).includes(req.params.electionId);
    res.json({ success: true, hasVoted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking vote status.' });
  }
};

// @route  GET /api/votes/verify/:electionId  — admin can verify chain integrity
exports.verifyElectionChain = async (req, res) => {
  try {
    const result = await verifyChain(req.params.electionId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying chain.' });
  }
};
