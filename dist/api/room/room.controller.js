"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const room_service_1 = require("./room.service");
const logger_service_1 = require("../../services/logger.service");
const chat_service_1 = require("../chat/chat.service");
const chat_controller_1 = require("../chat/chat.controller");
class RoomController {
    static async getRooms(req, res) {
        try {
            const rooms = await room_service_1.RoomService.query(req.query);
            res.json(rooms);
        }
        catch (err) {
            logger_service_1.logger.error('Failed to get rooms', err);
            res.status(500).send({ err: 'Failed to get rooms' });
        }
    }
    static async getRoom(req, res) {
        try {
            const roomId = req.params.id;
            const room = await room_service_1.RoomService.getById(roomId);
            const roomChat = await (0, chat_controller_1.getChatByRoomId)(roomId);
            res.json({ ...room, chat: roomChat });
        }
        catch (err) {
            logger_service_1.logger.error('Failed to get room', err);
            res.status(500).send({ err: 'Failed to get room' });
        }
    }
    static async addRoom(req, res) {
        try {
            const room = req.body;
            // room.createdBy = req.user.id
            const addedRoom = await room_service_1.RoomService.add(room);
            const newChat = await RoomController._addChat(addedRoom.id);
            res.json({ ...addedRoom, chat: newChat });
        }
        catch (err) {
            logger_service_1.logger.error('Failed to add room', err);
            res.status(500).send({ err: 'Failed to add room' });
        }
    }
    static async _addChat(roomId) {
        try {
            const chatToAdd = {
                roomId,
                messages: [],
            };
            const addedChat = await (0, chat_service_1.addChatService)(chatToAdd);
            return addedChat;
        }
        catch (error) {
            logger_service_1.logger.error('Failed to add chat to room', error);
            throw error;
        }
    }
    static async updateRoom(req, res) {
        try {
            const room = await room_service_1.RoomService.update(req.params.id, req.body);
            res.json(room);
        }
        catch (err) {
            logger_service_1.logger.error('Failed to update room', err);
            res.status(500).send({ err: 'Failed to update room' });
        }
    }
    static async deleteRoom(req, res) {
        try {
            await room_service_1.RoomService.remove(req.params.id);
            res.send({ msg: 'Deleted successfully' });
        }
        catch (err) {
            logger_service_1.logger.error('Failed to delete room', err);
            res.status(500).send({ err: 'Failed to delete room' });
        }
    }
}
exports.RoomController = RoomController;
