"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (process.env.NODE_ENV === 'production') {
    exports.config = {
        dbURL: process.env.MONGO_URL ||
            'mongodb+srv://theUser:thePass@cluster0-klgzh.mongodb.net/test?retryWrites=true&w=majority',
        dbName: process.env.DB_NAME || 'blabla',
    };
}
else {
    exports.config = {
        dbURL: process.env.MONGO_URL ||
            'mongodb+srv://theUser:thePass@cluster0-klgzh.mongodb.net/test?retryWrites=true&w=majority',
        dbName: process.env.DB_NAME || 'blabla',
    };
}
// config.isGuestMode = true
