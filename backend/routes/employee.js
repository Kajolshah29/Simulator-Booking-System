const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function validateName(name) {
  return name.length >= 2 && name.length <= 50;
}

function validateDepartment(department) {
  return department.length >= 2 && department.length <= 50;
}

function validateRole(role) {
  // Only allow P1, P2, P3, P4 roles for new employees
  return ['P1', 'P2', 'P3', 'P4'].includes(role);
}

// Get list of employees (for managers)
router.get('/list', auth, async function(req, res) {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    // Get all employees in the manager's department
    const employees = await User.find({ 
      department: req.user.department,
      role: { $ne: 'manager' } // Exclude other managers
    }).select('-password');

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new employee
router.post('/add', auth, async function(req, res) {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const { name, email, password, role, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' 
      });
    }

    // Validate role (must be P1, P2, P3, or P4)
    if (!validateRole(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Role must be P1, P2, P3, or P4' 
      });
    }

    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with P-category role
    user = new User({
      name,
      email,
      password, // Password will be hashed by the User model's pre-save hook
      role, // This will be one of P1, P2, P3, P4
      department,
      status: 'active',
      permissions: {
        canManageUsers: false,
        canManageBookings: true,
        canViewReports: false
      }
    });

    // Save user
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(name, email, password);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue with the response even if email fails
    }

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ user: userData });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get role requests
router.get('/role-requests', auth, async function(req, res) {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    // Get all role requests for employees in the manager's department
    const requests = await User.find({
      department: req.user.department,
      roleRequest: { $exists: true, $ne: null }
    }).select('name email role roleRequest roleRequestReason roleRequestDate');

    // Format the requests
    const formattedRequests = requests.map(user => ({
      id: user._id,
      employee: user.name,
      currentRole: user.role,
      requestedRole: user.roleRequest,
      reason: user.roleRequestReason,
      requestDate: user.roleRequestDate,
      status: user.roleRequestStatus || 'pending'
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching role requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve role request
router.post('/role-requests/:id/approve', auth, async function(req, res) {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee is in manager's department
    if (employee.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied. Employee not in your department' });
    }

    // Update employee role
    employee.role = employee.roleRequest;
    employee.roleRequest = null;
    employee.roleRequestReason = null;
    employee.roleRequestDate = null;
    employee.roleRequestStatus = 'approved';

    await employee.save();

    res.json({ message: 'Role request approved successfully' });
  } catch (error) {
    console.error('Error approving role request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject role request
router.post('/role-requests/:id/reject', auth, async function(req, res) {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee is in manager's department
    if (employee.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied. Employee not in your department' });
    }

    // Clear role request
    employee.roleRequest = null;
    employee.roleRequestReason = null;
    employee.roleRequestDate = null;
    employee.roleRequestStatus = 'rejected';

    await employee.save();

    res.json({ message: 'Role request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting role request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 