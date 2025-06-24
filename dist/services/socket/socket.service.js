"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketAPI = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const logger_service_1 = require("../logger.service");
const setupSocketAPI = async (server) => {
    const pubClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
        },
    });
    // Use Redis adapter
    io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    io.on('connection', (socket) => {
        logger_service_1.logger.info(`New client connected: ${socket.id}`);
        socket.on('join-room', async (room) => {
            try {
                if (socket.rooms.has(room))
                    return;
                socket.join(room);
                logger_service_1.logger.info(`Client: ${socket.id} joined room: ${room}`);
                await pubClient.sAdd(`room:${room}:members`, socket.id);
                // Fetch current members with error handling
                const memberIds = await pubClient.sMembers(`room:${room}:members`);
                const members = await Promise.all(memberIds.map(async (id) => {
                    try {
                        let retrivedUser = await pubClient.get(`user:${id}`);
                        if (!retrivedUser)
                            return null;
                        const user = JSON.parse(retrivedUser);
                        return { ...user, socketId: id };
                    }
                    catch (error) {
                        logger_service_1.logger.error(`Error fetching user ${id}:`, error);
                        return null;
                    }
                }));
                // Filter out null members before emitting
                const validMembers = members.filter(Boolean);
                io.to(room).emit('members-change', validMembers);
            }
            catch (error) {
                logger_service_1.logger.error(`Error in join-room handler:`, error);
            }
        });
        socket.on('set-user-socket', async (user) => {
            // Store JSON string for this socket (or user ID)
            console.log(user);
            await pubClient.set(`user:${socket.id}`, JSON.stringify(user));
            await pubClient.set(`userSocket:${user.id}`, socket.id);
        });
        socket.on('user-left', async (room) => {
            socket.leave(room);
            logger_service_1.logger.info(`Client: ${socket.id} left room: ${room}`);
            await pubClient.sRem(`room:${room}:members`, socket.id);
            // Fetch current members after leaving
            const memberIds = await pubClient.sMembers(`room:${room}:members`);
            const members = await Promise.all(memberIds.map(async (id) => {
                let retrivedUser = await pubClient.get(`user:${id}`);
                if (!retrivedUser)
                    return null;
                const user = JSON.parse(retrivedUser);
                return { ...user, socketId: id };
            }));
            io.to(room).emit('room-members', members);
            console.log(`Client: ${socket.id} leaved room: ${room}, members: ${members.length}`);
            io.to(room).emit('members-change', members);
        });
        socket.on('end-meeting', async (room) => {
            socket.leave(room);
            logger_service_1.logger.info(`User removed room: ${room}`);
            // await pubClient.sRem(`room:${room}:members`, socket.id)
            io.to(room).emit('end-meeting');
        });
        // Just before the socket is disconnected
        socket.on('disconnecting', async () => {
            for (const room of socket.rooms) {
                if (room === socket.id)
                    continue;
                await pubClient.sRem(`room:${room}:members`, socket.id);
                const members = await pubClient.sMembers(`room:${room}:members`);
                io.to(room).emit('room-members', members);
            }
        });
        // 7) WEbrtc SIGNALING: forward “offer”, “answer”, and “ice-candidate” to the intended peer
        //    Each handler expects a payload `{ to: <targetSocketId>, ... }`. We use socket.to(to).emit(...)
        socket.on('offer', async (data) => {
            const { to, offer, room } = data;
            console.log('data: ', data);
            // Identify if 'to' is a socket ID or UUID
            const idType = identifyIdType(to);
            let modifiedTo;
            if (idType === 'unknown') {
                logger_service_1.logger.error(`Invalid ID format: ${to}`);
                return;
            }
            if (idType === 'uuid') {
                // If 'to' is a UUID, we need to fetch the corresponding socket ID
                const userSocketId = await pubClient.get(`userSocket:${to}`);
                if (!userSocketId) {
                    logger_service_1.logger.error(`User with UUID ${to} not found`);
                    return;
                }
                modifiedTo = userSocketId;
            }
            else {
                // If 'to' is a socket ID, we can use it directly
                modifiedTo = to;
            }
            // logger.info(`🌐 OFFER from ${socket.id} → ${modifiedTo} (room=${room})`)
            // Include the room in the offer data
            socket.to(modifiedTo).emit('offer', {
                from: socket.id,
                offer,
                // room, // Include room in the offer data
            });
        });
        socket.on('answer', async (data) => {
            const { to, answer, room } = data;
            const idType = identifyIdType(to);
            let modifiedTo;
            if (idType === 'unknown') {
                logger_service_1.logger.error(`Invalid ID format: ${to}`);
                return;
            }
            if (idType === 'uuid') {
                // If 'to' is a UUID, we need to fetch the corresponding socket ID
                const userSocketId = await pubClient.get(`userSocket:${to}`);
                if (!userSocketId) {
                    logger_service_1.logger.error(`User with UUID ${to} not found`);
                    return;
                }
                modifiedTo = userSocketId;
            }
            else {
                // If 'to' is a socket ID, we can use it directly
                modifiedTo = to;
            }
            // logger.info(`🌐 ANSWER from ${socket.id} → ${to} (room=${room})`)
            socket.to(modifiedTo).emit('answer', {
                from: socket.id,
                answer,
                // room, // Include room in answer data
            });
        });
        socket.on('ice-candidate', async (data) => {
            const { to, candidate, room } = data;
            const idType = identifyIdType(to);
            let modifiedTo;
            if (idType === 'unknown') {
                logger_service_1.logger.error(`Invalid ID format: ${to}`);
                return;
            }
            if (idType === 'uuid') {
                // If 'to' is a UUID, we need to fetch the corresponding socket ID
                const userSocketId = await pubClient.get(`userSocket:${to}`);
                if (!userSocketId) {
                    logger_service_1.logger.error(`User with UUID ${to} not found`);
                    return;
                }
                modifiedTo = userSocketId;
            }
            else {
                // If 'to' is a socket ID, we can use it directly
                modifiedTo = to;
            }
            // logger.info(
            //   `🌐 ICE-CANDIDATE from ${socket.id} → ${modifiedTo} (room=${room})`
            // )
            socket.to(modifiedTo).emit('ice-candidate', {
                from: socket.id,
                candidate,
                // room, // Include room in ICE candidate data
            });
        });
        socket.on('chat-send-msg', (data) => {
            logger_service_1.logger.info(`New chat msg from socket [${socket.id}] in room [${data.room}]`);
            io.to(data.room).emit('chat-add-msg', data.msg);
        });
        // After the socket is disconnected
        socket.on('disconnect', () => {
            logger_service_1.logger.info(`Client disconnected: ${socket.id}`);
        });
    });
    // Handle Redis errors
    pubClient.on('error', (err) => logger_service_1.logger.error('Redis PUB error', err));
    subClient.on('error', (err) => logger_service_1.logger.error('Redis SUB error', err));
    process.on('SIGINT', async () => {
        await pubClient.disconnect();
        await subClient.disconnect();
        process.exit(0);
    });
};
exports.setupSocketAPI = setupSocketAPI;
function identifyIdType(id) {
    // 1) Check for PostgreSQL UUID (hex digits, with hyphens in 8-4-4-4-12 pattern)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(id)) {
        return 'uuid';
    }
    // 2) Check for Socket.IO’s default ID format:
    //    • exactly 20 characters
    //    • characters from A–Z, a–z, 0–9, “–” or “_” (URL-safe base64 subset)
    const socketIdRegex = /^[A-Za-z0-9_-]{20}$/;
    if (socketIdRegex.test(id)) {
        return 'socket';
    }
    // 3) If neither pattern matched, return “unknown”
    return 'unknown';
}
