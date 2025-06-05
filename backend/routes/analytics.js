const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');

// Get analytics data
router.get('/', auth, requirePermission('canViewReports'), async (req, res) => {
  try {
    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get active users (users with bookings in the last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      'bookings': {
        $elemMatch: {
          startTime: { $gte: twentyFourHoursAgo }
        }
      }
    });

    // Calculate utilization rate (bookings in use / total capacity)
    const activeBookings = await Booking.countDocuments({
      status: 'in_progress'
    });
    const totalCapacity = 5; // Assuming 5 simulators
    const utilizationRate = Math.round((activeBookings / totalCapacity) * 100);

    // Calculate average session duration
    const completedBookings = await Booking.find({
      status: 'completed',
      endTime: { $exists: true }
    });
    const totalDuration = completedBookings.reduce((acc, booking) => {
      const duration = booking.endTime - booking.startTime;
      return acc + duration;
    }, 0);
    const averageSession = Math.round(totalDuration / (completedBookings.length || 1) / (1000 * 60)); // Convert to minutes

    // Calculate early end rate
    const earlyEnds = completedBookings.filter(booking => {
      const duration = booking.endTime - booking.startTime;
      const expectedDuration = booking.duration * 60 * 1000; // Convert minutes to milliseconds
      return duration < expectedDuration;
    });
    const earlyEndRate = Math.round((earlyEnds.length / (completedBookings.length || 1)) * 100);

    res.json({
      totalBookings,
      activeUsers,
      utilizationRate,
      averageSession,
      earlyEndRate
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router; 