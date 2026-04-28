/**
 * Email Templates
 * Minimal professional templates for MVP notifications
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Customer confirmation - request received
 */
function customerRequestConfirmation(data) {
  const { fullName, description, requestId } = data;
  const safeFullName = escapeHtml(fullName || 'Customer');
  const safeDescription = escapeHtml(description || 'No description provided');
  const safeRequestId = escapeHtml(requestId);
  
  const subject = 'Your service request has been received';
  
  const text = `Hello ${fullName},

Thank you for contacting Call-a-Technician. We have received your service request.

Request ID: ${requestId}
Description: ${description}

Our team will review your request and contact you shortly to schedule a technician.

If you have any questions, please reply to this email or call our support line.

Best regards,
Call-a-Technician Team`;

  const html = `<p>Hello ${safeFullName},</p>
<p>Thank you for contacting <strong>Call-a-Technician</strong>. We have received your service request.</p>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Request ID:</strong></td><td>${safeRequestId}</td></tr>
  <tr><td><strong>Description:</strong></td><td>${safeDescription}</td></tr>
</table>
<p>Our team will review your request and contact you shortly to schedule a technician.</p>
<p>If you have any questions, please reply to this email or call our support line.</p>
<p>Best regards,<br>Call-a-Technician Team</p>`;

  return { subject, text, html };
}

/**
 * Technician assignment - new job assigned
 */
function technicianAssigned(data) {
  const { techName, jobTitle, jobDescription, customerName, customerPhone, customerAddress, jobId } = data;
  const safeTechName = escapeHtml(techName || 'Technician');
  const safeJobTitle = escapeHtml(jobTitle || 'Your service request');
  const safeJobDescription = escapeHtml(jobDescription || 'No description provided');
  const safeCustomerName = escapeHtml(customerName || 'Customer');
  const safeCustomerPhone = escapeHtml(customerPhone || 'N/A');
  const safeCustomerAddress = escapeHtml(customerAddress || 'N/A');
  const safeJobId = escapeHtml(jobId);
  
  const subject = `New job assigned: ${jobTitle}`;
  
  const text = `Hello ${techName},

A new job has been assigned to you.

Job: ${jobTitle}
Description: ${jobDescription}

Customer Details:
Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}

Please log in to your technician portal to view full details and accept this job.

Job ID: ${jobId}

Best regards,
Call-a-Technician Admin`;

  const html = `<p>Hello ${safeTechName},</p>
<p>A new job has been <strong>assigned to you</strong>.</p>
<h3>Job Details</h3>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Job:</strong></td><td>${safeJobTitle}</td></tr>
  <tr><td><strong>Description:</strong></td><td>${safeJobDescription}</td></tr>
</table>
<h3>Customer Details</h3>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Name:</strong></td><td>${safeCustomerName}</td></tr>
  <tr><td><strong>Phone:</strong></td><td>${safeCustomerPhone}</td></tr>
  <tr><td><strong>Address:</strong></td><td>${safeCustomerAddress}</td></tr>
</table>
<p>Please log in to your <a href="/tech-view">technician portal</a> to view full details and accept this job.</p>
<p><small>Job ID: ${safeJobId}</small></p>
<p>Best regards,<br>Call-a-Technician Admin</p>`;

  return { subject, text, html };
}

/**
 * Customer notification - technician assigned
 */
function customerTechnicianAssigned(data) {
  const { customerName, techName, jobTitle, scheduledWindow } = data;

  const safeCustomerName = customerName || 'Customer';
  const safeTechName = techName || 'your technician';
  const safeScheduledWindow = scheduledWindow || 'To be confirmed';
  const safeJobTitle = escapeHtml(jobTitle || 'Your service request');

  const subject = `Technician assigned: ${jobTitle}`;

  const text = `Hello ${safeCustomerName},

Good news, a technician has now been assigned to your service request.

Technician: ${safeTechName}
Job: ${jobTitle}
Scheduled appointment: ${safeScheduledWindow}

Next steps:
- Your technician will arrive within the scheduled window.
- Please keep your phone available in case they need to contact you.

If you need to update anything before the appointment, please contact our support team.

Best regards,
Call-a-Technician Team`;

  const html = `<p>Hello ${escapeHtml(safeCustomerName)},</p>
<p>Good news, a technician has now been <strong>assigned</strong> to your service request.</p>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Technician:</strong></td><td>${safeTechName}</td></tr>
  <tr><td><strong>Job:</strong></td><td>${safeJobTitle}</td></tr>
  <tr><td><strong>Scheduled appointment:</strong></td><td>${safeScheduledWindow}</td></tr>
</table>
<p><strong>Next steps:</strong></p>
<ul>
  <li>Your technician will arrive within the scheduled window.</li>
  <li>Please keep your phone available in case they need to contact you.</li>
</ul>
<p>If you need to update anything before the appointment, please contact our support team.</p>
<p>Best regards,<br>Call-a-Technician Team</p>`;

  return { subject, text, html };
}

/**
 * Job completed - notification to admin
 */
function jobCompletedAdmin(data) {
  const { adminName, jobTitle, jobId, techName, completedAt, customerName } = data;
  const safeAdminName = escapeHtml(adminName || 'Admin');
  const safeJobTitle = escapeHtml(jobTitle || 'Completed job');
  const safeJobId = escapeHtml(jobId);
  const safeTechName = escapeHtml(techName || 'Technician');
  const safeCompletedAt = escapeHtml(completedAt || '—');
  const safeCustomerName = escapeHtml(customerName || 'Unknown');
  
  const subject = `Job completed: ${jobTitle}`;
  
  const text = `Hello ${adminName},

A job has been marked as completed by the assigned technician.

Job: ${jobTitle}
Job ID: ${jobId}
Customer: ${customerName}
Technician: ${techName}
Completed: ${completedAt}

Please review and close this job when ready.

Best regards,
Call-a-Technician System`;

  const html = `<p>Hello ${safeAdminName},</p>
<p>A job has been <strong>marked as completed</strong> by the assigned technician.</p>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Job:</strong></td><td>${safeJobTitle}</td></tr>
  <tr><td><strong>Job ID:</strong></td><td>${safeJobId}</td></tr>
  <tr><td><strong>Customer:</strong></td><td>${safeCustomerName}</td></tr>
  <tr><td><strong>Technician:</strong></td><td>${safeTechName}</td></tr>
  <tr><td><strong>Completed:</strong></td><td>${safeCompletedAt}</td></tr>
</table>
<p>Please <a href="/app">review and close this job</a> when ready.</p>
<p>Best regards,<br>Call-a-Technician System</p>`;

  return { subject, text, html };
}

/**
 * Admin notification - new job request received
 */
function adminNewRequestNotification(data) {
  const { customerName, customerPhone, customerEmail, description, requestId } = data;
  const safeCustomerName = escapeHtml(customerName || 'Customer');
  const safeCustomerPhone = escapeHtml(customerPhone || 'N/A');
  const safeCustomerEmail = escapeHtml(customerEmail || 'Not provided');
  const safeDescription = escapeHtml(description || 'No description provided');
  const safeRequestId = escapeHtml(requestId);

  const subject = `New job request: ${customerName}`;

  const text = `New job request received!

Customer: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || 'Not provided'}
Description: ${description}

Request ID: ${requestId}

Log in to your admin portal to review and create a job from this request.

Best regards,
Call-a-Technician System`;

  const html = `<p><strong>New job request received!</strong></p>
<table style="background:#f5f5f5;padding:15px;margin:15px 0;">
  <tr><td><strong>Customer:</strong></td><td>${safeCustomerName}</td></tr>
  <tr><td><strong>Phone:</strong></td><td>${safeCustomerPhone}</td></tr>
  <tr><td><strong>Email:</strong></td><td>${safeCustomerEmail}</td></tr>
  <tr><td><strong>Description:</strong></td><td>${safeDescription}</td></tr>
  <tr><td><strong>Request ID:</strong></td><td>${safeRequestId}</td></tr>
</table>
<p>Log in to your <a href="/app">admin portal</a> to review and create a job from this request.</p>
<p>Best regards,<br>Call-a-Technician System</p>`;

  return { subject, text, html };
}

module.exports = {
  customerRequestConfirmation,
  technicianAssigned,
  customerTechnicianAssigned,
  jobCompletedAdmin,
  adminNewRequestNotification,
};
