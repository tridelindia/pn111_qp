const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

/**
 * Sends an email using AWS SES
 * @param {string} to - Recipient email address (must be verified in Sandbox mode)
 * @param {string} subject - Email subject
 * @param {string} message - Email body (text or HTML)
 * @param {string} [from=process.env.SENDER_EMAIL] - Sender email (default: env variable)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
async function sendEmail(to, subject, message, from = process.env.SENDER_EMAIL) {
  if (!to || !subject || !message) {
    throw new Error("Missing required fields: to, subject, or message");
  }

  if (!AWS.config.credentials) {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const transporter = nodemailer.createTransport({
    SES: { ses, aws: AWS }
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: message, // `<p>${message}</p>` for HTML
    });

    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("AWS SES Error:", error);
    return { success: false, error: error.message };
  }
}

module.exports = sendEmail;