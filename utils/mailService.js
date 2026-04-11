const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

transporter
  .verify()
  .then(() => {
    console.log("Mail transporter is ready");
  })
  .catch((err) => {
    console.error("Mail transporter verify failed:", err);
  });

const sendVerificationEmail = async (email, html, subject) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("sendVerificationEmail failed:", error);
    throw error;
  }
};

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("WEB_URL:", process.env.WEB_URL);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

module.exports = { sendVerificationEmail };