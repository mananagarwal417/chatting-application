// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/user');
const Contact=require('../models/contact');
// const { sendOtpHandler, verifyOtpHandler } = require("../controllers/authController");


router.get('/profile', auth, async (req, res) => {
  try {
    // req.user.id comes from signed JWT payload
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error in /profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const search = req.query.search || '';

    const users = await User.find({
      username: { $regex: search, $options: 'i' }
    })
    .select('_id username email avatarUrl');

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { firstname, lastname, email, subject, message } = req.body;
    const contact = new Contact({ firstname, lastname, email, subject, message });
    await contact.save();
    console.log("Contact message received:", { firstname, lastname, email, subject, message });
    res.status(200).json({ message: "Message received" });
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/phone-search', auth, async (req, res) => {
  try {
    console.log("🔥 Incoming phone search:", req.query);

    const { phone } = req.query;
    // console.log("🔥 Extracted phone:", phone, "Type:", typeof phone);

    const user = await User.findOne({
      phone: { $regex: phone?.toString(), $options: "i" }
    }).select('_id username email phone');

    // console.log("🔥 Query result:", user);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Phone search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * POST /public-key
 * body: { publicKey: <JWK object> }
 * stores the caller's public key (JWK) in their user doc
 */
router.post('/public-key', auth, async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ message: 'publicKey required' });

    await User.findByIdAndUpdate(req.user.id, { publicKey });
    res.json({ message: 'Public key saved' });
  } catch (err) {
    console.error('Save publicKey error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /:id/public-key
 * returns the publicKey JWK for a given user id
 */
router.get('/:id/public-key', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('publicKey');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.publicKey) return res.status(404).json({ message: 'Public key not set' });
    res.json({ publicKey: user.publicKey });
  } catch (err) {
    console.error('Get publicKey error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// OTP LOGIN ROUTES
// router.post("/send-otp", sendOtpHandler);
// router.post("/verify-otp", verifyOtpHandler);






module.exports = router;
