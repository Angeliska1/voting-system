const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

// @route GET /api/elections  — public list of elections
exports.getPublicElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find().sort({ createdAt: -1 });

    // Auto-update status
    for (const e of elections) {
      let changed = false;
      if (e.status === 'upcoming' && now >= new Date(e.startDate)) { e.status = 'active'; changed = true; }
      else if (e.status === 'active' && now >= new Date(e.endDate)) { e.status = 'closed'; changed = true; }
      if (changed) await e.save();
    }

    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/elections/:id  — single election with candidates
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    const candidates = await Candidate.find({ election: election._id });
    res.json({ success: true, election, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
