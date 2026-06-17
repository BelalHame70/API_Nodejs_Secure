const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendVerificationEmail = async (email, html, subject) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const result = await apiInstance.sendTransacEmail({
      sender: {
        email: "belahamed0@gmail.com", 
        name: "Agent Lap Email"
      },
      to: [{ email }],
      subject,
      htmlContent: html
    });

    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Email failed:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };