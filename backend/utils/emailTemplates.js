const emailTemplates = {
  welcomeEmail: (name, email, password) => ({
    subject: 'Welcome to Simulator Booking!',
    html: `
      <h1>Welcome to Simulator Booking!</h1>
      <p>Hello ${name},</p>
      <p>Welcome to the Simulator Booking system. Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p>Please login and change your password immediately for security reasons.</p>
      <p>You can access the system at: ${process.env.FRONTEND_URL}</p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `
  }),

  passwordResetEmail: (name, resetLink) => ({
    subject: 'Reset your Booking Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `
  }),

  bookingConfirmationEmail: (name, bookingDetails, icsAttachment) => ({
    subject: 'Your Simulator Booking Details',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Hello ${name},</p>
      <p>Your simulator booking has been confirmed. Here are the details:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
        <p><strong>Duration:</strong> ${bookingDetails.duration} minutes</p>
        <p><strong>Location:</strong> ${bookingDetails.location}</p>
      </div>
      <p>A calendar invitation has been attached to this email.</p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `,
    attachments: [{
      filename: 'booking.ics',
      content: icsAttachment
    }]
  }),

  reminderEmail: (name, bookingDetails) => ({
    subject: 'Your Simulator Session Starts Soon!',
    html: `
      <h1>Session Reminder</h1>
      <p>Hello ${name},</p>
      <p>This is a reminder that your simulator session starts in 10 minutes:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
        <p><strong>Location:</strong> ${bookingDetails.location}</p>
      </div>
      <p>Please make sure to arrive on time.</p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `
  }),

  earlyReleaseEmail: (name, availableSlot) => ({
    subject: 'Simulator Now Available — Book Now!',
    html: `
      <h1>Early Release Notification</h1>
      <p>Hello ${name},</p>
      <p>A simulator slot has become available earlier than scheduled:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Date:</strong> ${availableSlot.date}</p>
        <p><strong>Available Time:</strong> ${availableSlot.startTime} - ${availableSlot.endTime}</p>
        <p><strong>Location:</strong> ${availableSlot.location}</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL}/book" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Book Now</a></p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `
  }),

  overrideRequestEmail: (name, requestDetails) => ({
    subject: 'Override Requested for Your Slot',
    html: `
      <h1>Override Request Notification</h1>
      <p>Hello ${name},</p>
      <p>An override request has been made for your booked slot:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Date:</strong> ${requestDetails.date}</p>
        <p><strong>Time:</strong> ${requestDetails.startTime} - ${requestDetails.endTime}</p>
        <p><strong>Requested By:</strong> ${requestDetails.requestedBy}</p>
        <p><strong>Reason:</strong> ${requestDetails.reason}</p>
      </div>
      <p>Please review this request and take appropriate action.</p>
      <p>Best regards,<br>Simulator Booking Team</p>
    `
  })
};

module.exports = emailTemplates; 