const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, html, subject) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject,
      html
    });

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("sendVerificationEmail failed:", error);
    throw error;
  }
};

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("WEB_URL:", process.env.WEB_URL);
console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

module.exports = { sendVerificationEmail };