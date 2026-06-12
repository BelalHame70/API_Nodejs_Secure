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

const findAllUsers = () =>
  User.find().select("-password").sort({ createdAt: -1 });

const findAllAdmins = () =>
  User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });

const updateRole = (user_id, role) =>
  User.findOneAndUpdate(
    { user_id },
    { role },
    { new: true }
  ).select("-password");

const deleteUserById = (user_id) =>
  User.findOneAndDelete({ user_id });

module.exports = {
  createUser,
  findByEmail,
  findByUserId,
  updateByUserId,
  deleteByUserId,
  updatePassword,
  verifyUser,
  findAllUsers,
  findAllAdmins,
  updateRole,
  deleteUserById
};