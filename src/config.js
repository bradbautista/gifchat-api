module.exports = {
  PORT: process.env.PORT || 17043,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:0m8x34s3@localhost/gifchat_db',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres:0m8x34s3@localhost/gifchat_db-test'
}
