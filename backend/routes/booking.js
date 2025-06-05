const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { 
  sendBookingConfirmationEmail, 
  sendReminderEmail, 
  sendEarlyReleaseEmail,
  sendOverrideRequestEmail,
  sendOverrideApprovalEmail,
  sendOverrideRejectionEmail
} = require('../utils/email');
const OverrideRequest = require('../models/OverrideRequest');

// Get all bookings
router.get('/', auth, requirePermission('canViewBookings'), async (req, res) => {
  try {
    // Disable caching for this response
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    console.log('Fetching bookings...');
    console.log('User ID from auth middleware:', req.user.id);

    const { startDate, endDate, simulator, department, status } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate) };
      query.endTime = { $lte: new Date(endDate) };
    }

    if (simulator) {
      query.simulator = simulator;
    }

    if (department) {
      query.department = department;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    console.log('Database query:', query);

    const bookings = await Booking.find(query)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .sort({ startTime: 1 });

    console.log('Fetched bookings from DB:', bookings);

    // Before sending, check if bookings data looks correct
    if (!bookings || bookings.length === 0) {
        console.log('No bookings found for this query.');
    }

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { date, startTime, endTime, location } = req.body;
    const userId = req.user.id;

    // Create new booking
    const booking = new Booking({
      user: userId,
      date,
      startTime,
      endTime,
      location,
      status: 'confirmed'
    });

    await booking.save();

    // Get user details for email
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(user.name, user.email, {
        date,
        startTime,
        endTime,
        location
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with the response even if email fails
    }

    // Schedule reminder email
    const reminderTime = new Date(date);
    reminderTime.setHours(parseInt(startTime.split(':')[0]) - 1);
    reminderTime.setMinutes(parseInt(startTime.split(':')[1]));

    if (reminderTime > new Date()) {
      setTimeout(async () => {
        try {
          await sendReminderEmail(user.name, user.email, {
            date,
            startTime,
            endTime,
            location
          });
        } catch (error) {
          console.error('Error sending reminder email:', error);
        }
      }, reminderTime - new Date());
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a booking
router.put('/:id', auth, requirePermission('canManageBookings'), async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      simulator,
      status,
      priority,
      participants,
      department
    } = req.body;

    // Check for booking conflicts (excluding the current booking)
    const conflictingBooking = await Booking.findOne({
      _id: { $ne: req.params.id },
      simulator,
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: 'Booking conflict detected',
        conflictingBooking
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startTime,
        endTime,
        simulator,
        status,
        priority,
        participants,
        department
      },
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('participants', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Delete a booking
router.delete('/:id', auth, requirePermission('canManageBookings'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// End booking early
router.put('/:id/end-early', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update booking status
    booking.status = 'completed';
    await booking.save();

    // Notify other users about early release
    const otherUsers = await User.find({
      _id: { $ne: req.user.id },
      department: req.user.department
    });

    for (const user of otherUsers) {
      try {
        await sendEarlyReleaseEmail(user.name, user.email, {
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          location: booking.location
        });
      } catch (error) {
        console.error(`Error sending early release email to ${user.email}:`, error);
      }
    }

    res.json({ message: 'Booking ended early successfully' });
  } catch (error) {
    console.error('Error ending booking early:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request override
router.post('/:id/request-override', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Get booking owner
    const bookingOwner = await User.findById(booking.user);
    if (!bookingOwner) {
      return res.status(404).json({ message: 'Booking owner not found' });
    }

    // Get requesting user
    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }

    // Send override request email
    try {
      await sendOverrideRequestEmail(bookingOwner.name, bookingOwner.email, {
        requesterName: requestingUser.name,
        requesterEmail: requestingUser.email,
        reason,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location
      });
    } catch (error) {
      console.error('Error sending override request email:', error);
      return res.status(500).json({ message: 'Error sending override request' });
    }

    res.json({ message: 'Override request sent successfully' });
  } catch (error) {
    console.error('Error requesting override:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get override requests
router.get('/override-requests', auth, async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const requests = await OverrideRequest.find({
      department: req.user.department,
      status: 'pending'
    }).populate('bookingId', 'title startTime endTime simulator')
      .populate('requesterId', 'name email');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching override requests:', error);
    res.status(500).json({ message: 'Error fetching override requests' });
  }
});

// Approve override request
router.post('/override-requests/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const request = await OverrideRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Override request not found' });
    }

    // Update request status
    request.status = 'approved';
    await request.save();

    // Update booking
    const booking = await Booking.findById(request.bookingId);
    if (booking) {
      booking.status = 'cancelled';
      await booking.save();
    }

    // Notify requester
    const requester = await User.findById(request.requesterId);
    if (requester) {
      try {
        await sendOverrideApprovalEmail(requester.email, {
          bookingTitle: booking?.title,
          startTime: booking?.startTime,
          endTime: booking?.endTime
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }
    }

    res.json({ message: 'Override request approved successfully' });
  } catch (error) {
    console.error('Error approving override request:', error);
    res.status(500).json({ message: 'Error approving override request' });
  }
});

// Reject override request
router.post('/override-requests/:id/reject', auth, async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const request = await OverrideRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Override request not found' });
    }

    // Update request status
    request.status = 'rejected';
    await request.save();

    // Notify requester
    const requester = await User.findById(request.requesterId);
    if (requester) {
      try {
        await sendOverrideRejectionEmail(requester.email, {
          bookingTitle: request.bookingId.title,
          startTime: request.bookingId.startTime,
          endTime: request.bookingId.endTime
        });
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
      }
    }

    res.json({ message: 'Override request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting override request:', error);
    res.status(500).json({ message: 'Error rejecting override request' });
  }
});

module.exports = router; 