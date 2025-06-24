"use strict";
// src/models/user.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const prisma = new client_1.PrismaClient();
/**
 * User model with extended functionality for user-specific operations
 */
exports.User = {
    ...prisma.user,
    /**
     * Create a new user with password hashing
     */
    async createWithHash(data) {
        const hashedPassword = await (0, bcrypt_1.hash)(data.password, 10);
        console.log(data);
        if (data.isRemember)
            delete data.isRemember;
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
        return user;
    },
    /**
     * Find a user by email
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    },
};
