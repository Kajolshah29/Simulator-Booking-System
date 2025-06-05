const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  simulator: {
    type: String,
    required: true,
    enum: ['SIM1', 'SIM2', 'SIM3', 'SIM4']
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    required: true,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P4'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add index for efficient querying
bookingSchema.index({ startTime: 1, endTime: 1, simulator: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 