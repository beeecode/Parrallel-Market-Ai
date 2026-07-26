const conversationService = require('../services/conversation.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await conversationService.listConversations(req.user, req.query);
  sendSuccess(res, { message: 'Conversations retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const conversation = await conversationService.getConversation(req.user, req.params.id);
  sendSuccess(res, { message: 'Conversation retrieved successfully.', data: { conversation } });
});

const create = asyncHandler(async (req, res) => {
  const conversation = await conversationService.createConversation(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Conversation created successfully.', data: { conversation } });
});

const update = asyncHandler(async (req, res) => {
  const conversation = await conversationService.updateConversation(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Conversation updated successfully.', data: { conversation } });
});

const remove = asyncHandler(async (req, res) => {
  await conversationService.archiveConversation(req.user, req.params.id);
  sendSuccess(res, { message: 'Conversation deleted successfully.' });
});

const archive = asyncHandler(async (req, res) => {
  await conversationService.archiveConversation(req.user, req.params.id);
  sendSuccess(res, { message: 'Conversation archived successfully.' });
});

const restore = asyncHandler(async (req, res) => {
  const conversation = await conversationService.restoreConversation(req.user, req.params.id);
  sendSuccess(res, { message: 'Conversation restored successfully.', data: { conversation } });
});

module.exports = { list, getById, create, update, remove, archive, restore };
