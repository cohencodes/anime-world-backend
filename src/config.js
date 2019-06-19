module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/anime-world',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY
};
