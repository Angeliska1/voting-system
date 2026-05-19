const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Vote = require('../models/Vote');

// ── ELECTIONS ────────────────────────────────────────────────
exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, positions } = req.body;
    const election = await Election.create({
      title, description, startDate, endDate,
      positions: Array.isArray(positions) ? positions : positions.split(',').map(p => p.trim()),
      createdBy: req.user.id,
    });
    await AuditLog.create({ action: 'ELECTION_CREATED', performedBy: req.user.id, details: `Election: ${title}`, ipAddress: req.ip });
    res.status(201).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 }).populate('createdBy', 'fullName');
    // Auto-update statuses based on date
    const now = new Date();
    for (const e of elections) {
      if (e.status === 'upcoming' && now >= e.startDate) {
        e.status = 'active'; await e.save();
      } else if (e.status === 'active' && now >= e.endDate) {
        e.status = 'closed'; await e.save();
      }
    }
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    await AuditLog.create({ action: 'ELECTION_UPDATED', performedBy: req.user.id, details: `Election ${election.title} updated`, ipAddress: req.ip });
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    if (election.status === 'active') return res.status(400).json({ success: false, message: 'Cannot delete an active election.' });
    await Candidate.deleteMany({ election: req.params.id });
    await Vote.deleteMany({ election: req.params.id });
    await election.deleteOne();
    await AuditLog.create({ action: 'ELECTION_DELETED', performedBy: req.user.id, details: `Election ${election.title} deleted`, ipAddress: req.ip });
    res.json({ success: true, message: 'Election deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CANDIDATES ───────────────────────────────────────────────
exports.addCandidate = async (req, res) => {
  try {
    const { fullName, party, position, bio, image, electionId } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    if (!election.positions.includes(position))
      return res.status(400).json({ success: false, message: `Position "${position}" is not in this election.` });

    const candidate = await Candidate.create({ fullName, party, position, bio, image, election: electionId });
    res.status(201).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Candidate removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── USERS ────────────────────────────────────────────────────
exports.getVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, voters, total: voters.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── AUDIT LOGS ───────────────────────────────────────────────
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DASHBOARD STATS ──────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalVoters, totalElections, activeElections, totalVotes, recentLogs] = await Promise.all([
      User.countDocuments({ role: 'voter' }),
      Election.countDocuments(),
      Election.countDocuments({ status: 'active' }),
      Vote.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(5).populate('performedBy', 'fullName'),
    ]);
    res.json({ success: true, stats: { totalVoters, totalElections, activeElections, totalVotes }, recentLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
