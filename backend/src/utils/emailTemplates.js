// Email templates for various notifications

const welcomeEmail = (fullName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to EduTrack!</h1>
        </div>
        <div class="content">
          <p>Hello ${fullName},</p>
          <p>Thank you for registering with EduTrack - Your Project Allocation & Progress Tracking System.</p>
          <p>You can now log in and start managing your projects.</p>
          <p>Best regards,<br>EduTrack Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EduTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const proposalApprovedEmail = (fullName, projectTitle) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Proposal Approved!</h1>
        </div>
        <div class="content">
          <p>Hello ${fullName},</p>
          <p>Great news! Your project proposal "<strong>${projectTitle}</strong>" has been approved.</p>
          <p>You can now proceed with the project development and milestone submissions.</p>
          <p>Best regards,<br>EduTrack Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EduTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const proposalRejectedEmail = (fullName, projectTitle, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Proposal Requires Revision</h1>
        </div>
        <div class="content">
          <p>Hello ${fullName},</p>
          <p>Your project proposal "<strong>${projectTitle}</strong>" requires revision.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please make the necessary changes and resubmit.</p>
          <p>Best regards,<br>EduTrack Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EduTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const milestoneDeadlineEmail = (fullName, milestoneTitle, dueDate) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Milestone Deadline Reminder</h1>
        </div>
        <div class="content">
          <p>Hello ${fullName},</p>
          <p>This is a reminder that the milestone "<strong>${milestoneTitle}</strong>" is due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
          <p>Please ensure you submit your work before the deadline.</p>
          <p>Best regards,<br>EduTrack Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EduTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const feedbackReceivedEmail = (fullName, milestoneTitle) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Feedback Received</h1>
        </div>
        <div class="content">
          <p>Hello ${fullName},</p>
          <p>You have received new feedback for your milestone "<strong>${milestoneTitle}</strong>".</p>
          <p>Please log in to EduTrack to view the feedback.</p>
          <p>Best regards,<br>EduTrack Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EduTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  welcomeEmail,
  proposalApprovedEmail,
  proposalRejectedEmail,
  milestoneDeadlineEmail,
  feedbackReceivedEmail
};
