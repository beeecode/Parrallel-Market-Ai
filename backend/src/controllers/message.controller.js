const messageService = require('../services/message.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

/** Backs the nested `GET /conversations/:id/messages` route. */
const listForConversation = asyncHandler(async (req, res) => {
  const result = await messageService.listMessagesForConversation(req.user, req.params.id, req.query);
  sendSuccess(res, { message: 'Messages retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const message = await messageService.getMessage(req.user, req.params.id);
  sendSuccess(res, { message: 'Message retrieved successfully.', data: { message } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Message sent successfully.', data: { message } });
});

const update = asyncHandler(async (req, res) => {
  const message = await messageService.updateMessage(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Message updated successfully.', data: { message } });
});

const remove = asyncHandler(async (req, res) => {
  await messageService.deleteMessage(req.user, req.params.id);
  sendSuccess(res, { message: 'Message deleted successfully.' });
});

const markRead = asyncHandler(async (req, res) => {
  const message = await messageService.markRead(req.user, req.params.id);
  sendSuccess(res, { message: 'Message marked as read.', data: { message } });
});

module.exports = { listForConversation, getById, sendMessage, update, remove, markRead };
