const TokenPassword = require("../models/tokenpassword");

const createTokenPassword = (data) => TokenPassword.create(data);

const findValidTokenByHash = (tokenHash) =>
  TokenPassword.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });

const markTokenUsed = (id) =>
  TokenPassword.updateOne(
    { _id: id },
    { used: true, usedAt: new Date() }
  );

module.exports = {
  createTokenPassword,
  findValidTokenByHash,
  markTokenUsed
};