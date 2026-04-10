require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "your_email@gmail.com",
  subject: "Test Email",
  text: "Hello from Nodemailer!"
}, (err, info) => {
  if (err) console.log("Error:", err);
  else console.log("Sent:", info.response);
});
