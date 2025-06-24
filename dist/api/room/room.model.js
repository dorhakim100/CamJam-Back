"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.Room = {
    ...prisma.room,
    async create(data) {
        return await prisma.room.create({ data: data });
    },
};
