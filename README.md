# Smart Simulator Booking System

A smart, real-time, priority-based booking platform for managing shared simulator resources in technical and research environments. It enables structured slot booking, priority override logic, early session release handling, and real-time notifications with calendar integration.

---

## Features

### User Functionality
- Priority-aware booking:
  - **P1**: Critical deadline work (same-day booking allowed)
  - **P2**: Ongoing experiment (same-day booking allowed)
  - **P3**: Standard work (7-day advance required)
  - **P4**: Practice/training (7-day advance required)
- Session start and end actions
- Early session end auto-notifies other users
- Real-time reminders via email
- ICS calendar invites with .ics file attachment
- Light/Dark mode toggle

### Admin Panel
- User invite system with temporary password email
- Force password reset on first login
- Override request approval and resolution
- Booking monitoring and conflict management
- Analytics: active users, utilization %, session durations
- CSV/Excel log export

---

## Tech Stack

- **Frontend**: Next.js, TailwindCSS
- **Backend**: Node.js, Express.js
- **Auth**: Email/password login (hashed), first-login reset flow
- **Database**: Firebase Firestore / MongoDB Atlas
- **Email**: Nodemailer with SMTP (Gmail or custom domain)
- **Calendar**: ICS generator (`ics` npm package)
- **Hosting**: Vercel / Netlify / AWS Amplify

---

## Environment Setup

Create a `.env` file with:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=your_email@gmail.com

# App Configuration
APP_BASE_URL=https://your-app-url.com
SESSION_SECRET=your_secret
