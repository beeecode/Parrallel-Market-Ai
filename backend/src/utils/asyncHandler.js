/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * middleware instead of crashing the process.
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} handler
 */
function asyncHandler(handler) {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

module.exports = { asyncHandler };
