const { Router } = require('express');

const { notImplemented } = require('../controllers/notImplemented.controller');

/** Every method and sub-path under the mounted router responds 501 until the feature phase lands. */
function createNotImplementedRouter() {
  const router = Router();
  router.use(notImplemented);
  return router;
}

module.exports = { createNotImplementedRouter };
