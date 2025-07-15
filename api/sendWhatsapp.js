require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
  /**
   * @param {string} phoneNumber - Recipient's number (with country code)
   * @param {string} contentSid - Twilio template SID
   * @param {object} variables - Template variables { "1": "value1", "2": "value2" }
   * @returns {Promise<{success: bool, sid?: string, error?: string}>}
   */
  sendMessage: async (phoneNumber, contentSid, variables) => {
    try {
      const message = await client.messages.create({
        from: 'whatsapp:+14155238886',
        contentSid: contentSid,
        contentVariables: JSON.stringify(variables),
        to: `whatsapp:${phoneNumber}`
      });
      return { success: true, sid: message.sid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};