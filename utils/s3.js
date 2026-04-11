const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
console.log("KEY:", process.env.AWS_ACCESS_KEY_ID);
console.log("SECRET:", process.env.AWS_SECRET_ACCESS_KEY);
module.exports = s3;
