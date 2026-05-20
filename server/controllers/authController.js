const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp, fullName) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 OTP for ${fullName} (${email})`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'VoteNG <onboarding@resend.dev>',
    to: email,
    subject: 'Your VoteNG Verification Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#00563B;">VoteNG — Verification Code</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your one-time verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#00563B;text-align:center;padding:16px;background:#f0f7f4;border-radius:6px;">
          ${otp}
        </div>
        <p style="color:#666;font-size:13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, nin, voterCardNumber, password, state, lga } = req.body;

    const existingNIN = await User.findOne({ nin });
    if (existingNIN) return res.status(400).json({ success: false, message: 'This NIN is already registered.' });

    const existingCard = await User.findOne({ voterCardNumber });
    if (existingCard) return res.status(400).json({ success: false, message: 'This voter card number is already registered.' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({ fullName, email, phone, nin, voterCardNumber, password, state, lga, otp, otpExpiry, isVerified: false });
    await user.save();

    try {
      await sendOTP(email, otp, fullName);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    await AuditLog.create({
      action: 'VOTER_REGISTERED',
      performedBy: user._id,
      details: `New voter registered: ${email}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: process.env.NODE_ENV !== 'production'
        ? 'Registered! Check your SERVER TERMINAL for the OTP code.'
        : 'Registration successful! Check your email for the OTP code.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+otp +otpExpiry');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Account verified! Welcome to VoteNG.',
      token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        role: user.role, state: user.state, lga: user.lga,
        votedElections: user.votedElections,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// @route POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified.' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTP(user.email, otp, user.fullName);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    res.json({
      success: true,
      message: process.env.NODE_ENV !== 'production'
        ? 'New OTP printed in server terminal.'
        : 'New OTP sent to your email.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not resend OTP. Please try again.' });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please check your email for the OTP.',
        userId: user._id,
      });
    }

    await AuditLog.create({
      action: user.role === 'admin' ? 'ADMIN_LOGIN' : 'VOTER_LOGIN',
      performedBy: user._id,
      details: `${user.role} logged in: ${email}`,
      ipAddress: req.ip,
    });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        role: user.role, state: user.state, lga: user.lga,
        votedElections: user.votedElections,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
