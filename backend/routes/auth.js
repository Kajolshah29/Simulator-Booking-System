const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');
const Booking = require('../models/Booking');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send reset email
    try {
      await sendPasswordResetEmail(user.name, resetLink);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Error sending password reset email' });
    }

    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Request role change
router.post('/request-role-change', auth, async (req, res) => {
  try {
    const { requestedRole, reason } = req.body;

    // Validate request
    if (!requestedRole || !['P1', 'P2', 'P3', 'P4', 'manager'].includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid role requested' });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide a detailed reason (minimum 10 characters)' });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has a pending request
    if (user.roleRequest && user.roleRequestStatus === 'pending') {
      return res.status(400).json({ message: 'You already have a pending role request' });
    }

    // Update user with role request
    user.roleRequest = requestedRole;
    user.roleRequestReason = reason;
    user.roleRequestDate = new Date();
    user.roleRequestStatus = 'pending';

    await user.save();

    res.json({ message: 'Role change request submitted successfully' });
  } catch (error) {
    console.error('Error requesting role change:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user by ID and explicitly select the password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash the new password (assuming your User model has a pre-save hook for hashing)
    user.password = newPassword; // The pre-save hook will hash this

    // Clear any password reset tokens (optional, but good practice)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Get user stats (weekly usage and active bookings count)
router.get('/me/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate the start and end of the current week (assuming week starts on Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start week on Monday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0); // End of the week (exclusive)

    // Find completed bookings this week for weekly usage calculation
    const completedBookingsThisWeek = await Booking.find({
      $or: [{ createdBy: userId }, { participants: userId }],
      status: 'completed',
      endTime: { $gte: startOfWeek, $lt: endOfWeek }
    });

    // Calculate total weekly usage duration in minutes
    let totalWeeklyUsageMinutes = 0;
    completedBookingsThisWeek.forEach(booking => {
      if (booking.startTime && booking.endTime) {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        totalWeeklyUsageMinutes += Math.round(durationMs / (1000 * 60)); // Convert ms to minutes
      }
    });

    // Find active and upcoming bookings for active bookings count
    const activeUpcomingBookings = await Booking.countDocuments({
      $or: [{ createdBy: userId }, { participants: userId }],
      status: { $in: ['scheduled', 'in-progress'] }
    });

    // Assuming a fixed weekly limit for now
    const weeklyLimitHours = 6;
    const weeklyLimitMinutes = weeklyLimitHours * 60;

    res.json({
      totalWeeklyUsageMinutes,
      weeklyLimitMinutes,
      activeBookingsCount: activeUpcomingBookings
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error fetching user stats' });
  }
});

module.exports = router;
