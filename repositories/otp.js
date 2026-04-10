const Otp = require("../models/otp");

const createOtp = (data) => Otp.create(data);

const findValidOtp = (otp_number) =>
  Otp.findOne({
    otp_number,
    used: false,
    expire_at: { $gt: new Date() }
  });

const markUsed = (id) =>
  Otp.updateOne({ _id: id }, { used: true });

module.exports = {
  createOtp,
  findValidOtp,
  markUsed
};