const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./src/config/env');
const { openApiDocument } = require('./src/config/swagger');
const { API_ROUTES } = require('./src/constants/apiRoutes');
const { errorHandler } = require('./src/middlewares/errorHandler');
const { notFound } = require('./src/middlewares/notFound');
const { rateLimiter } = require('./src/middlewares/rateLimiter');
const { requestLogger } = require('./src/middlewares/requestLogger');
const { sanitize } = require('./src/middlewares/sanitize');
const routes = require('./src/routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(requestLogger);
app.use(rateLimiter);
app.use(compression());
app.use(hpp());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(sanitize);

app.use(API_ROUTES.root, routes);
app.use(API_ROUTES.root + API_ROUTES.docs, swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
