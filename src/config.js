module.exports = {
  PORT: process.env.PORT || 17043,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin:password@localhost/blogful',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin:password@localhost/blogful-test'
}
