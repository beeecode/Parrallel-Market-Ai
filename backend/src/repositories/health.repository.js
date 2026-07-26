const mongoose = require('mongoose');

const { HealthLog } = require('../models/HealthLog');

/**
 * A real round-trip against MongoDB (not just `readyState` introspection),
 * using the one model this phase is allowed to touch.
 */
async function checkDatabaseConnection() {
  try {
    if (mongoose.connection.readyState !== 1) return false;
    await HealthLog.findOne().limit(1).lean();
    return true;
  } catch {
    return false;
  }
}

module.exports = { checkDatabaseConnection };
