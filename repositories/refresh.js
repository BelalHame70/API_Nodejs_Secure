const RefreshToken = require("../models/refresh");

const saveRefreshToken = (data) => RefreshToken.create(data);

const deleteRefreshToken = (token_hash) =>
  RefreshToken.deleteOne({ token_hash });

const findByUserId = (user_id) =>
  RefreshToken.find({ user_id });

const findByTokenHash = (token_hash) =>
  RefreshToken.findOne({ token_hash });

module.exports = {
  saveRefreshToken,
  deleteRefreshToken,
  findByUserId,
  findByTokenHash
};