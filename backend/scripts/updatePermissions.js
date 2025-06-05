const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updatePermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      // Convert 'employee' role to 'P1'
      if (user.role === 'employee') {
        console.log(`Converting role from 'employee' to 'P1' for user: ${user.email}`);
        user.role = 'P1';
      }

      if (user.role === 'manager') {
        user.permissions = {
          canManageUsers: true,
          canManageBookings: true,
          canViewBookings: true,
          canViewReports: true
        };
      } else {
        user.permissions = {
          canManageUsers: false,
          canManageBookings: true,
          canViewBookings: true,
          canViewReports: false
        };
      }
      await user.save();
      console.log(`Updated permissions for user: ${user.email}`);
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating permissions:', error);
    process.exit(1);
  }
}

updatePermissions(); 