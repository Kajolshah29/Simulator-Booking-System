const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['manager', 'employee'],
    default: 'employee'
  },
  department: String,
  permissions: {
    canManageUsers: Boolean,
    canManageBookings: Boolean,
    canViewReports: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Sample users data
const users = [
  {
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'manager',
    department: 'Management',
    permissions: {
      canManageUsers: true,
      canManageBookings: true,
      canViewReports: true
    }
  },
  {
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'employee123',
    role: 'employee',
    department: 'Operations',
    permissions: {
      canManageUsers: false,
      canManageBookings: true,
      canViewReports: false
    }
  },
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'john123',
    role: 'employee',
    department: 'Research',
    permissions: {
      canManageUsers: false,
      canManageBookings: true,
      canViewReports: false
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'sarah123',
    role: 'manager',
    department: 'Development',
    permissions: {
      canManageUsers: true,
      canManageBookings: true,
      canViewReports: true
    }
  }
];

// Hash passwords before saving
async function hashPasswords(users) {
  const hashedUsers = await Promise.all(users.map(async (user) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    return {
      ...user,
      password: hashedPassword
    };
  }));
  return hashedUsers;
}

// Connect to MongoDB and seed users
async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and insert users
    const hashedUsers = await hashPasswords(users);
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Successfully seeded users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedUsers(); 