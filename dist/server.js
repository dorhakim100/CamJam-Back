"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const prisma_1 = require("./db/prisma");
const auth_routes_1 = require("./api/auth/auth.routes");
const user_routes_1 = require("./api/user/user.routes");
// import { itemRoutes } from './api/item/item.routes'
const room_routes_1 = require("./api/room/room.routes");
const chat_1 = require("./api/chat");
const socket_service_1 = require("./services/socket/socket.service");
const setupAls_middleware_1 = require("./middleware/setupAls.middleware");
const logger_service_1 = require("./services/logger.service");
dotenv_1.default.config();
init();
async function init() {
    try {
        const app = (0, express_1.default)();
        const server = http_1.default.createServer(app);
        // Express App Config
        app.use((0, cookie_parser_1.default)());
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        prisma_1.prisma
            .$connect()
            .then(() => console.log('🔗 Postgres (Prisma) connected'))
            .catch((err) => console.error('❌ Postgres (Prisma) connection error', err));
        if (process.env.NODE_ENV === 'production') {
            app.use(express_1.default.static(path_1.default.resolve('public')));
        }
        else {
            const corsOptions = {
                origin: [
                    'http://127.0.0.1:3000',
                    'http://localhost:3000',
                    'http://127.0.0.1:5173',
                    'http://localhost:5173',
                ],
                credentials: true,
            };
            app.use((0, cors_1.default)(corsOptions));
        }
        app.all('*', setupAls_middleware_1.setupAsyncLocalStorage);
        // Routes
        app.use('/api/auth', auth_routes_1.authRoutes);
        app.use('/api/user', user_routes_1.userRoutes);
        app.use('/api/room', room_routes_1.roomRoutes);
        app.use('/api/chat', chat_1.chatRoutes);
        // Setup Socket.IO
        await (0, socket_service_1.setupSocketAPI)(server);
        console.log('✅ Socket.IO setup complete');
        // Serve frontend in production
        app.get('/**', (req, res) => {
            res.sendFile(path_1.default.resolve('public/index.html'));
        });
        // Database connection
        const connectDB = async () => {
            try {
                const conn = await mongoose_1.default.connect(process.env.MONGO_URL);
                logger_service_1.logger.info(`MongoDB Connected: ${conn.connection.host}`);
            }
            catch (error) {
                logger_service_1.logger.error('Error connecting to MongoDB:', error);
                process.exit(1);
            }
        };
        // Start server
        const port = process.env.PORT || 3030;
        connectDB().then(() => {
            server.listen(port, () => {
                logger_service_1.logger.info('Server is running on port: ' + port);
            });
        });
    }
    catch (err) {
        logger_service_1.logger.error('Failed to initialize server', err);
        process.exit(1);
    }
}
