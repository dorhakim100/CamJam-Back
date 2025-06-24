"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const logger_service_1 = require("../../services/logger.service");
const setupAls_middleware_1 = require("../../middleware/setupAls.middleware");
class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;
        const isRemember = req.body.isRemember;
        try {
            res.clearCookie('loginToken', { sameSite: 'none', secure: true });
            const user = await auth_service_1.AuthService.login(email, password, isRemember);
            const loginToken = auth_service_1.AuthService.getLoginToken(user);
            console.log('loginToken: ', loginToken);
            res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true });
            (0, setupAls_middleware_1.setLoggedinUser)(user);
            res.json(user);
        }
        catch (err) {
            logger_service_1.logger.error('Failed to Login ' + err);
            res.status(401).send({ err: 'Failed to Login' });
        }
    }
    static async signup(req, res) {
        try {
            const credentials = req.body;
            if (!credentials) {
                res.status(400).send({ err: 'Missing signup information' });
                return;
            }
            const account = await auth_service_1.AuthService.signup(credentials);
            const loginToken = auth_service_1.AuthService.getLoginToken(account);
            res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true });
            (0, setupAls_middleware_1.setLoggedinUser)(account);
            res.json(account);
        }
        catch (err) {
            logger_service_1.logger.error('Failed to signup ' + err);
            res.status(400).send({ err: 'Failed to signup' });
        }
    }
    static async logout(req, res) {
        try {
            // res.clearCookie('loginToken')
            res.clearCookie('loginToken', { sameSite: 'none', secure: true });
            res.send({ msg: 'Logged out successfully' });
        }
        catch (err) {
            res.status(500).send({ err: 'Failed to logout' });
        }
    }
}
exports.AuthController = AuthController;
