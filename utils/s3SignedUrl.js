const s3 = require("./s3");

const getSignedFileUrl = async (fileKey) => {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Expires: 60 * 5 // 5 minutes
  });
};

module.exports = { getSignedFileUrl };