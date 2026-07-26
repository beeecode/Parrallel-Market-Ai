const { Router } = require('express');

const { API_ROUTES } = require('../constants/apiRoutes');
const authRouter = require('./auth.routes');
const conversationsRouter = require('./conversations.routes');
const customerAgentsRouter = require('./customerAgents.routes');
const customersRouter = require('./customers.routes');
const healthRouter = require('./health.routes');
const insightsRouter = require('./insights.routes');
const messagesRouter = require('./messages.routes');
const productsRouter = require('./products.routes');
const reportsRouter = require('./reports.routes');
const requestSimulationRouter = require('./requestSimulation.routes');
const simulationsRouter = require('./simulations.routes');
const usersRouter = require('./users.routes');

const router = Router();

router.use(API_ROUTES.health, healthRouter);
router.use(API_ROUTES.auth, authRouter);
router.use(API_ROUTES.users, usersRouter);
router.use(API_ROUTES.products, productsRouter);
router.use(API_ROUTES.customers, customersRouter);
router.use(API_ROUTES.simulations, simulationsRouter);
router.use(API_ROUTES.customerAgents, customerAgentsRouter);
router.use(API_ROUTES.conversations, conversationsRouter);
router.use(API_ROUTES.messages, messagesRouter);
router.use(API_ROUTES.reports, reportsRouter);
router.use(API_ROUTES.insights, insightsRouter);
router.use(API_ROUTES.requestSimulation, requestSimulationRouter);

module.exports = router;
