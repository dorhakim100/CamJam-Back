"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatByRoomIdService = getChatByRoomIdService;
exports.updateChatByRoomIdService = updateChatByRoomIdService;
exports.addChatService = addChatService;
exports.addMessageService = addMessageService;
const mongodb_1 = require("mongodb");
const db_service_1 = require("../../db/mongo/db.service");
const user_service_1 = require("../user/user.service");
const CHAT_COLLECTION = 'chat';
const MESSAGE_COLLECTION = 'message';
async function getChatByRoomIdService(roomId) {
    try {
        const criteria = { roomId };
        const aggregationPipeline = [
            { $match: criteria }, // Match chats based on criteria
            {
                $addFields: {
                    // Convert each user id in the users array from a string to an ObjectId.
                    messages: {
                        $map: {
                            input: '$messages',
                            as: 'messageId',
                            in: { $toObjectId: '$$messageId' },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: MESSAGE_COLLECTION, // The collection to join with for message details
                    localField: 'messages', // The converted latestMessage ObjectId
                    foreignField: '_id', // The _id field in the message collection
                    // as: 'messageDetails', // Output array with the matching message document(s)
                    as: 'messages', // Output array with the matching message document(s)
                },
            },
            {
                $project: {
                    _id: 1,
                    // messageDetails: 1,
                    messages: 1,
                    roomId: 1,
                },
            },
        ];
        const collection = await db_service_1.dbService.getCollection(CHAT_COLLECTION);
        let chat = await collection.aggregate(aggregationPipeline).toArray();
        chat = chat[0];
        const messagesWithUsers = await Promise.all(chat.messages.map(async (message) => {
            const userId = message.fromId;
            const user = await user_service_1.UserService.getById(userId);
            const userToReturn = {
                email: user?.email,
                fullname: user?.fullname,
                id: user?.id,
                imgUrl: user?.imgUrl,
            };
            return { ...message, user: userToReturn };
        }));
        chat.messages = messagesWithUsers;
        // if (!chats || chats.length === 0) {
        //   return null // Return null if no item is found
        // }
        // const chat = await collection.findOne({ roomId })
        // if (!chat) return null
        // chat._id = chat._id.toString()
        return chat;
    }
    catch (err) {
        throw err;
    }
}
async function updateChatByRoomIdService(chatId, messageId) {
    try {
        const criteria = { _id: mongodb_1.ObjectId.createFromHexString(chatId) };
        const collection = await db_service_1.dbService.getCollection(CHAT_COLLECTION);
        const savedChat = await collection.updateOne(criteria, {
            $push: { messages: messageId },
        });
        // savedChat._id = savedChat._id.toString()
        return savedChat;
    }
    catch (err) {
        throw err;
    }
}
async function addChatService(chatData) {
    try {
        const collection = await db_service_1.dbService.getCollection(CHAT_COLLECTION);
        const { insertedId } = await collection.insertOne({
            roomId: chatData.roomId,
            messages: chatData.messages,
        });
        return { _id: insertedId.toString(), ...chatData };
    }
    catch (err) {
        throw err;
    }
}
async function addMessageService(messageData) {
    try {
        const chatId = messageData.chatId;
        if (!chatId)
            throw new Error(`Couldn't send message`);
        delete messageData.chatId;
        const collection = await db_service_1.dbService.getCollection(MESSAGE_COLLECTION);
        const { insertedId } = await collection.insertOne(messageData);
        const savedChat = await updateChatByRoomIdService(chatId, insertedId);
        return { _id: insertedId.toString(), ...messageData };
    }
    catch (err) {
        throw err;
    }
}
