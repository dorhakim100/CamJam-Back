"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatByRoomId = getChatByRoomId;
exports.addChat = addChat;
exports.addMessage = addMessage;
const chat_service_1 = require("./chat.service");
const logger_service_1 = require("../../services/logger.service");
// export async function getChatByRoomId(req: Request, res: Response) {
//   try {
//     const { roomId } = req.params
//     const chat = await getChatByRoomIdService(roomId)
//     res.json(chat)
//   } catch (err: any) {
//     logger.error('Failed to get chat', err)
//     res.status(500).send({ err: 'Failed to get chat' })
//   }
// }
async function getChatByRoomId(roomId) {
    try {
        const chat = await (0, chat_service_1.getChatByRoomIdService)(roomId);
        return chat;
    }
    catch (err) {
        logger_service_1.logger.error('Failed to get chat', err);
        throw err;
    }
}
async function addChat(req, res) {
    try {
        const chatData = req.body;
        const newChat = await (0, chat_service_1.addChatService)(chatData);
        res.json(newChat);
    }
    catch (err) {
        logger_service_1.logger.error('Failed to add chat', err);
        res.status(500).send({ err: 'Failed to add chat' });
    }
}
async function addMessage(req, res) {
    try {
        const messageData = req.body;
        const newMessage = await (0, chat_service_1.addMessageService)(messageData);
        res.json(newMessage);
    }
    catch (err) {
        logger_service_1.logger.error('Failed to add message', err);
        res.status(500).send({ err: 'Failed to add message' });
    }
}
