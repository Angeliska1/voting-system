const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    nin: {
      type: String,
      required: [true, 'NIN is required'],
      unique: true,
      trim: true,
    },
    voterCardNumber: {
      type: String,
      required: [true, 'Voter card number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['voter', 'admin'],
      default: 'voter',
    },
    state: { type: String, trim: true },
    lga: { type: String, trim: true },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    votedElections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
