"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../user/user.model");
const logger_service_1 = require("../../services/logger.service");
class AuthService {
    static async login(email, password, isRemember) {
        const user = await user_model_1.User.findByEmail(email);
        if (!user)
            throw new Error('Invalid email or password');
        if (isRemember)
            return user;
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            throw new Error('Invalid email or password');
        return user;
    }
    static async signup(credentials) {
        logger_service_1.logger.debug(`Auth.signup: ${credentials.email}`);
        if (!credentials.email || !credentials.password || !credentials.fullname)
            throw new Error('Missing required signup information');
        // const userExist = await User.findByEmail(credentials.email)
        // console.log(userExist)
        // if (userExist) throw new Error('Email already exists')
        return user_model_1.User.createWithHash(credentials);
    }
    static getLoginToken(user) {
        const userInfo = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
        };
        return jsonwebtoken_1.default.sign(userInfo, process.env.JWT_SECRET || 'Secret-Puk-1234', {
            expiresIn: '7d',
        });
        // return cryptr.encrypt(JSON.stringify(userInfo))
    }
}
exports.AuthService = AuthService;
