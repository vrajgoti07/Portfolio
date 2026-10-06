const nodemailer = require("nodemailer");

/**
 * SMTP Protocol Configuration with Nodemailer
 * Supports standard SMTP (e.g. Gmail SMTP, Outlook, AWS SES, or custom SMTP relay)
 */
const createSmtpTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "vrajgoti07@gmail.com";
  const pass = process.env.SMTP_PASS || "";

  // Transporter options configured with SMTP protocol specifications
  const transporterOptions = {
    host,
    port,
    secure, // true for 465, false for 587 / STARTTLS
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false // Avoid self-signed certificate rejection in local environments
    }
  };

  return nodemailer.createTransport(transporterOptions);
};

const transporter = createSmtpTransporter();

/**
 * Check if active SMTP credentials are provided
 */
const isSmtpConfigured = () => {
  return Boolean(process.env.SMTP_PASS && process.env.SMTP_PASS.trim() !== "");
};

/**
 * Core SMTP Mail Sender
 */
async function sendMail({ to, subject, html, text }) {
  const from = process.env.FROM_EMAIL || `Task Manager <${process.env.SMTP_USER || "vrajgoti07@gmail.com"}>`;

  if (!isSmtpConfigured()) {
    console.log(`[SMTP SIMULATED] To: ${to} | Subject: "${subject}"`);
    console.log(`[SMTP NOTICE] To send real emails, set your 16-character Google App Password in Backend/.env (SMTP_PASS=xxxx)`);
    return {
      success: true,
      simulated: true,
      message: "Email simulated successfully (SMTP_PASS not configured in .env)",
      info: { messageId: `simulated-${Date.now()}@taskmanager.local` }
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html
    });

    console.log(`[SMTP SUCCESS] Email sent to ${to} | MessageId: ${info.messageId}`);
    return { success: true, simulated: false, info };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send email to ${to}:`, error.message);
    // Graceful error return so business logic does not break
    return { success: false, error: error.message };
  }
}

/**
 * 1. Welcome Email on Registration
 */
async function sendWelcomeEmail(toEmail, userName = "") {
  const name = userName || toEmail.split("@")[0];
  const subject = "Welcome to Task Manager Portal";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6C63FF; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Your account on the <strong>Task Management Platform</strong> has been successfully created.
      </p>
      <div style="background: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #2d3748;"><strong>Registered Email:</strong> ${toEmail}</p>
        <p style="margin: 5px 0 0 0; color: #2d3748;"><strong>Assigned Administrator:</strong> vrajgoti07@gmail.com</p>
      </div>
      <p style="color: #4a5568; line-height: 1.6;">
        You can sign in to view any tasks assigned to you by the admin and advance your deliverables through the workflow.
      </p>
      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 0.85em; color: #a0aec0;">
        Automated notification sent via SMTP protocol • Task Management System
      </div>
    </div>
  `;
  return await sendMail({ to: toEmail, subject, html });
}

/**
 * 2. Task Assigned Notification Email
 */
async function sendTaskAssignmentEmail(toEmail, task) {
  const subject = `New Task Assigned: ${task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #00D4FF; margin-top: 0;">New Task Assigned</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Administrator <strong>vrajgoti07@gmail.com</strong> has assigned a new task to you:
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">${task.title}</h3>
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 0.95em;">
          <strong>Priority:</strong> <span style="color: #ea580c;">${task.priority || "Medium"}</span> | 
          <strong>Status:</strong> <span style="color: #ca8a04;">Pending</span>
        </p>
        <p style="margin: 0; color: #334155; line-height: 1.5;">
          ${task.description || "No description provided."}
        </p>
      </div>
      <p style="color: #4a5568; line-height: 1.6;">
        Please review the task details. You may edit pending requirements or begin work by advancing to <strong>Ongoing</strong>.
      </p>
      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 0.85em; color: #a0aec0;">
        Sent via SMTP protocol (nodemailer) from vrajgoti07@gmail.com
      </div>
    </div>
  `;
  return await sendMail({ to: toEmail, subject, html });
}

/**
 * 3. Task Deliverable Evaluated Notification Email
 */
async function sendTaskEvaluationEmail(toEmail, task) {
  const subject = `Deliverable Evaluated: ${task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #10B981; margin-top: 0;">Task Evaluation Completed</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Admin <strong>vrajgoti07@gmail.com</strong> has reviewed and evaluated your deliverable:
      </p>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin: 20px 0; border-radius: 6px;">
        <h3 style="margin: 0 0 10px 0; color: #0f172a;">${task.title}</h3>
        <p style="margin: 0 0 6px 0; color: #334155;">
          <strong>Evaluation Verdict:</strong> <span style="color: #15803d; font-weight: bold;">${task.evaluationVerdict}</span>
        </p>
        ${task.evaluationScore ? `<p style="margin: 0 0 6px 0; color: #334155;"><strong>Score:</strong> ${task.evaluationScore} / 100</p>` : ""}
        ${task.evaluationNotes ? `<p style="margin: 10px 0 0 0; color: #475569; font-style: italic;">"${task.evaluationNotes}"</p>` : ""}
      </div>
      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 0.85em; color: #a0aec0;">
        Sent via SMTP protocol (nodemailer) • Task Management System
      </div>
    </div>
  `;
  return await sendMail({ to: toEmail, subject, html });
}

/**
 * 4. Password Reset Notification Email
 */
async function sendPasswordResetSuccessEmail(toEmail) {
  const subject = "Security Alert: Password Updated";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #F59E0B; margin-top: 0;">Password Successfully Reset</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        This email confirms that the password for your account <strong>${toEmail}</strong> was recently changed.
      </p>
      <p style="color: #4a5568; line-height: 1.6;">
        If you performed this action, you can safely ignore this email. If you did not make this change, please contact the administrator (vrajgoti07@gmail.com) immediately.
      </p>
      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 0.85em; color: #a0aec0;">
        Security notice sent via SMTP protocol • Task Management System
      </div>
    </div>
  `;
  return await sendMail({ to: toEmail, subject, html });
}

/**
 * Test SMTP connection
 */
async function verifySmtpConnection() {
  if (!isSmtpConfigured()) {
    return {
      connected: false,
      message: "SMTP is in simulated mode. Set SMTP_PASS in .env to connect to live SMTP server."
    };
  }
  try {
    await transporter.verify();
    return { connected: true, message: "SMTP server handshake and credentials verified successfully!" };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendTaskEvaluationEmail,
  sendPasswordResetSuccessEmail,
  verifySmtpConnection,
  isSmtpConfigured
};
