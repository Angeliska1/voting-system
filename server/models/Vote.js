const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    // We store voter ID only to prevent double voting — never exposed in results
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: one vote per voter per election per position
voteSchema.index({ voter: 1, election: 1, position: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
