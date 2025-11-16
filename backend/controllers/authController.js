// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

// ----------------------------------------------
// NORMAL LOGIN
// ----------------------------------------------
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || user.profilePicture || null,
    };

    res.json({ token, user: safeUser, msg: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ----------------------------------------------
// REGISTER
// ----------------------------------------------
async function handleRegister(req, res) {
  try {
    const { username, email, password, profilePicture, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture,
      phone,
    });
    await newUser.save();

    const safeUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl || newUser.profilePicture || null,
    };

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ----------------------------------------------
// PHONE OTP LOGIN
// ----------------------------------------------
// const otpService = require('../services/otpServices');

// send OTP (for email or phone)
// async function sendOtpHandler(req, res) {
//   try {
//     const { recipient } = req.body; // recipient can be email or phone
//     if (!recipient) return res.status(400).json({ message: 'recipient required' });

//     // create OTP (may throw on rate limit)
//     const { code, expiresAt } = otpService.createOtp(recipient);

//     // === IMPORTANT ===
//     // For development/demo: return OTP in response so the user sees it.
//     // For production: send it via email/SMS and DO NOT return `code`.
//     // Example (dev):
//     return res.json({ message: 'OTP generated', otp: code, expiresAt });

//     // Example (production):
//     // await sendViaEmailOrSms(recipient, code)
//     // return res.json({ message: 'OTP sent' });

//   } catch (err) {
//     return res.status(429).json({ message: err.message || 'Failed to generate OTP' });
//   }
// }

// async function verifyOtpHandler(req, res) {
//   try {
//     const { recipient, otp } = req.body;
//     if (!recipient || !otp) return res.status(400).json({ message: 'recipient and otp required' });

//     const result = otpService.verifyOtp(recipient, otp);
//     if (!result.ok) {
//       return res.status(400).json({ message: result.reason });
//     }

//     // OTP matched. Now log the user in (example for email-based users)
//     // You can adapt: if recipient is email, find user by email; if phone, find by phone.
//     const user = await User.findOne({ email: recipient }) || await User.findOne({ phone: recipient });
//     if (!user) return res.status(404).json({ message: 'Account not found' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     return res.json({ message: 'OTP verified', token, user });

//   } catch (err) {
//     console.error('verifyOtp error', err);
//     return res.status(500).json({ message: 'Verification failed' });
//   }
// }

// ----------------------------------------------
// FINAL EXPORT (IMPORTANT!)
// ----------------------------------------------
module.exports = {
  handleLogin,
  handleRegister,
  // sendOtpHandler,
  // verifyOtpHandler,
};
