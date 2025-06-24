"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const router = (0, express_1.Router)();
router.post('/message', chat_controller_1.addMessage);
// router.post('/message/:messageId', updateMessage)
router.get('/:roomId', chat_controller_1.getChatByRoomId);
router.post('/', chat_controller_1.addChat);
exports.chatRoutes = router;
