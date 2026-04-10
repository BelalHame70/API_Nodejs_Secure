const EmailChangeToken = require("../models/EmailChangeToken");

const create = (data) => EmailChangeToken.create(data);

const findByTokenHash = (tokenHash) =>
  EmailChangeToken.findOne({ tokenHash });

const markUsed = (id) =>
  EmailChangeToken.findByIdAndUpdate(id, { used: true }, { new: true });

const invalidateAllForUser = (userId) =>
  EmailChangeToken.updateMany({ userId, used: false }, { used: true });

module.exports = {
  create,
  findByTokenHash,
  markUsed,
  invalidateAllForUser
};