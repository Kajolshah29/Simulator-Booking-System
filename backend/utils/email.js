const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send welcome email
const sendWelcomeEmail = async (name, email, password) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to SimCal',
    html: `
      <h2>Welcome to SimCal!</h2>
      <p>Dear ${name},</p>
      <p>Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <ul>
        <li>Email: ${email}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Please change your password after your first login.</p>
      <p>Thank you for using our system!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (name, email, bookingDetails) => {
  const { date, startTime, endTime, location } = bookingDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Confirmation',
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>Thank you for using our booking system.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send reminder email
const sendReminderEmail = async (name, email, bookingDetails) => {
  const { date, startTime, endTime, location } = bookingDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Reminder',
    html: `
      <h2>Booking Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a reminder for your upcoming booking:</p>
      <ul>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>Please make sure to arrive on time.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send early release notification
const sendEarlyReleaseEmail = async (name, email, bookingDetails) => {
  const { date, startTime, endTime, location } = bookingDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Simulator Available',
    html: `
      <h2>Simulator Available</h2>
      <p>Dear ${name},</p>
      <p>A simulator has become available earlier than scheduled:</p>
      <ul>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>You can check the booking system to see if this slot is still available.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send override request email
const sendOverrideRequestEmail = async (name, email, requestDetails) => {
  const { requesterName, requesterEmail, reason, date, startTime, endTime, location } = requestDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Override Request',
    html: `
      <h2>Booking Override Request</h2>
      <p>Dear ${name},</p>
      <p>${requesterName} (${requesterEmail}) has requested to override your booking:</p>
      <ul>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
        <li>Location: ${location}</li>
        <li>Reason: ${reason}</li>
      </ul>
      <p>Please log in to the booking system to approve or reject this request.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send override approval email
async function sendOverrideApprovalEmail(email, bookingDetails) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Override Request Approved',
    html: `
      <h1>Your Booking Override Request Has Been Approved</h1>
      <p>The following booking has been cancelled and is now available:</p>
      <ul>
        <li>Title: ${bookingDetails.bookingTitle}</li>
        <li>Start Time: ${new Date(bookingDetails.startTime).toLocaleString()}</li>
        <li>End Time: ${new Date(bookingDetails.endTime).toLocaleString()}</li>
      </ul>
      <p>You can now book this time slot.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Send override rejection email
async function sendOverrideRejectionEmail(email, bookingDetails) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Override Request Rejected',
    html: `
      <h1>Your Booking Override Request Has Been Rejected</h1>
      <p>Your request for the following booking has been rejected:</p>
      <ul>
        <li>Title: ${bookingDetails.bookingTitle}</li>
        <li>Start Time: ${new Date(bookingDetails.startTime).toLocaleString()}</li>
        <li>End Time: ${new Date(bookingDetails.endTime).toLocaleString()}</li>
      </ul>
      <p>Please try booking a different time slot.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendReminderEmail,
  sendEarlyReleaseEmail,
  sendOverrideRequestEmail,
  sendOverrideApprovalEmail,
  sendOverrideRejectionEmail
}; 