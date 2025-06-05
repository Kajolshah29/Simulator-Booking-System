const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['P1', 'P2', 'P3', 'P4', 'manager']
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  permissions: {
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageBookings: {
      type: Boolean,
      default: true
    },
    canViewBookings: {
      type: Boolean,
      default: true
    },
    canViewReports: {
      type: Boolean,
      default: false
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  roleRequest: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4', 'manager']
  },
  roleRequestReason: String,
  roleRequestDate: Date,
  roleRequestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Set default permissions based on role
userSchema.pre('save', async function(next) {
  if (this.isModified('role') || !this.permissions) {
    if (this.role === 'manager') {
      this.permissions = {
        canManageUsers: true,
        canManageBookings: true,
        canViewBookings: true,
        canViewReports: true
      };
    } else {
      this.permissions = {
        canManageUsers: false,
        canManageBookings: true,
        canViewBookings: true,
        canViewReports: false
      };
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 