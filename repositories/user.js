const User = require("../models/user");

const createUser = (data) => User.create(data);

const findByEmail = (email) => User.findOne({ email });

const findByUserId = (user_id) => User.findOne({ user_id });

const updateByUserId = (user_id, data) =>
  User.findOneAndUpdate({ user_id }, data, { new: true });

const deleteByUserId = (user_id) => User.deleteOne({ user_id });

const updatePassword = (user_id, hashedPassword) =>
  User.updateOne({ user_id }, { password: hashedPassword });

const verifyUser = (user_id) =>
  User.updateOne({ user_id }, { verified: true });

module.exports = {
  createUser,
  findByEmail,
  findByUserId,
  updateByUserId,
  deleteByUserId,
  updatePassword,
  verifyUser
};