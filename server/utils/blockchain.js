const crypto = require('crypto');
const VoteBlock = require('../models/VoteBlock');

const sha256 = (data) =>
  crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

const createGenesisBlock = async (electionId) => {
  const block = {
    blockIndex: 0,
    election: electionId,
    voteHash: 'GENESIS',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: new Date(),
  };
  block.blockHash = sha256(block);
  return await VoteBlock.create(block);
};

const addVoteBlock = async (electionId, voterId, candidateId, position) => {
  let lastBlock = await VoteBlock.findOne({ election: electionId }).sort({ blockIndex: -1 });
  if (!lastBlock) lastBlock = await createGenesisBlock(electionId);

  const salt = crypto.randomBytes(16).toString('hex');
  const voteHash = sha256({ voterId: voterId.toString(), candidateId: candidateId.toString(), position, salt });

  const newBlock = {
    blockIndex: lastBlock.blockIndex + 1,
    election: electionId,
    voteHash,
    previousHash: lastBlock.blockHash,
    timestamp: new Date(),
  };
  newBlock.blockHash = sha256(newBlock);
  return await VoteBlock.create(newBlock);
};

const verifyChain = async (electionId) => {
  const blocks = await VoteBlock.find({ election: electionId }).sort({ blockIndex: 1 });
  if (blocks.length === 0) return { valid: true, totalBlocks: 0 };

  for (let i = 1; i < blocks.length; i++) {
    const current = blocks[i];
    const previous = blocks[i - 1];

    if (current.previousHash !== previous.blockHash) {
      return { valid: false, brokenAt: current.blockIndex, reason: 'Previous hash mismatch — chain has been tampered with.' };
    }

    const recomputed = sha256({
      blockIndex: current.blockIndex,
      election: current.election,
      voteHash: current.voteHash,
      previousHash: current.previousHash,
      timestamp: current.timestamp,
    });

    if (recomputed !== current.blockHash) {
      return { valid: false, brokenAt: current.blockIndex, reason: 'Block hash invalid — data has been modified.' };
    }
  }

  return { valid: true, totalBlocks: blocks.length };
};

module.exports = { addVoteBlock, verifyChain, createGenesisBlock };
