const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    party: {
      type: String,
      required: [true, 'Party name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
