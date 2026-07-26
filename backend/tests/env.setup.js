// Runs before any test file (and therefore before `app.js`/`config/env.js`
// are required), so the required environment variables are always present.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/parallel_market_ai_test';
process.env.JWT_SECRET = 'test-only-access-secret-not-for-real-use-00000000';
process.env.JWT_REFRESH_SECRET = 'test-only-refresh-secret-not-for-real-use-0000000';
