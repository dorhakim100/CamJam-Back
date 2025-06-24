"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const logger_service_1 = require("../../services/logger.service");
class UserService {
    static async query(filterBy = {}) {
        try {
            const users = await user_model_1.User.findMany({
                where: {
                    OR: [
                        { email: { contains: filterBy.email, mode: 'insensitive' } },
                        { fullname: { contains: filterBy.fullname, mode: 'insensitive' } },
                    ],
                },
            });
            return users;
        }
        catch (err) {
            logger_service_1.logger.error('Failed to query users', err);
            throw err;
        }
    }
    static async getById(userId) {
        try {
            const user = await user_model_1.User.findUnique({
                where: { id: userId },
            });
            return user;
        }
        catch (err) {
            logger_service_1.logger.error(`Failed to get user ${userId}`, err);
            throw err;
        }
    }
    static async getByEmail(email) {
        try {
            const user = await user_model_1.User.findByEmail(email);
            return user;
        }
        catch (err) {
            logger_service_1.logger.error(`Failed to get user by email ${email}`, err);
            throw err;
        }
    }
    static async remove(userId) {
        try {
            await user_model_1.User.delete({
                where: { id: userId },
            });
        }
        catch (err) {
            logger_service_1.logger.error(`Failed to remove user ${userId}`, err);
            throw err;
        }
    }
    static async update(userId, userToUpdate) {
        try {
            const user = await user_model_1.User.update({
                where: { id: userId },
                data: userToUpdate,
            });
            return user;
        }
        catch (err) {
            logger_service_1.logger.error(`Failed to update user ${userId}`, err);
            throw err;
        }
    }
}
exports.UserService = UserService;
