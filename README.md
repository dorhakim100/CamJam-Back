# TypeScript Express Backend Starter

A modern, well-structured backend starter template using TypeScript, Express, MongoDB, and Socket.IO.

## Features

- 🚀 TypeScript for type safety
- 🔐 JWT Authentication
- 📦 MongoDB with Mongoose
- 🔌 Socket.IO integration
- 🎯 Clean Architecture (Routes, Controllers, Services)
- ⚡️ Express middleware for error handling and authentication
- 🔍 Environment variable configuration
- 🛠 ESLint for code quality

## Project Structure

```
src/
├── api/
│   └── users/
│       ├── user.controller.ts
│       ├── user.model.ts
│       ├── user.routes.ts
│       └── user.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── notFound.middleware.ts
├── services/
│   └── socket/
│       └── socket.service.ts
└── server.ts
```

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/backend-starter
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users

- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile` - Get user profile (protected)
- PUT `/api/users/profile` - Update user profile (protected)
- DELETE `/api/users/profile` - Delete user profile (protected)

## Socket.IO Events

- `connection` - Client connected
- `disconnect` - Client disconnected
- `join_room` - Join a room
- `leave_room` - Leave a room
- `send_message` - Send a message to a room
- `receive_message` - Receive a message in a room

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Feel free to submit issues and pull requests.

## License

MIT
