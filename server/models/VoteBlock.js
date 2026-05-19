const mongoose = require('mongoose');

// Each VoteBlock is one "block" in our hash chain.
// It does NOT store who voted for whom — only a cryptographic
// proof that a valid vote occurred, chained to the previous one.
const voteBlockSchema = new mongoose.Schema({
  blockIndex: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },

  // Anonymised vote fingerprint — SHA-256 of (voterId + candidateId + position + salt)
  voteHash: { type: String, required: true },

  // Hash of the previous block — creates the chain
  previousHash: { type: String, required: true },

  // This block's own hash — SHA-256 of everything above
  blockHash: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('VoteBlock', voteBlockSchema);
