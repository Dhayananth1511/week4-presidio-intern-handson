module.exports = {
  PORT: process.env.PORT ,
  SECRET_KEY: process.env.JWT_SECRET,
  COOKIE_NAME: process.env.COOKIE_NAME,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE) 
};
