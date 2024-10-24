if (!process.env.JWT_USER_PASSWORD || !process.env.JWT_ADMIN_PASSWORD) {
  console.error('Missing JWT secret keys in environment variables');
  process.exit(1);
}

const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;

module.exports = {
  JWT_USER_PASSWORD,
  JWT_ADMIN_PASSWORD,
};
