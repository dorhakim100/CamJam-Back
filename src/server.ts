import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { prisma } from './db/prisma'

import { authRoutes } from './api/auth/auth.routes'
import { userRoutes } from './api/user/user.routes'
// import { itemRoutes } from './api/item/item.routes'
import { roomRoutes } from './api/room/room.routes'
import { chatRoutes } from './api/chat'

import { setupSocketAPI } from './services/socket/socket.service'
import { setupAsyncLocalStorage } from './middleware/setupAls.middleware'
import { logger } from './services/logger.service'

dotenv.config()

init()

async function init() {
  try {
    const app = express()
    const server = http.createServer(app)

    // Express App Config
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    prisma
      .$connect()
      .then(() => console.log('🔗 Postgres (Prisma) connected'))
      .catch((err: string) =>
        console.error('❌ Postgres (Prisma) connection error', err)
      )

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.resolve('public')))
    } else {
      const corsOptions = {
        origin: [
          'http://127.0.0.1:3000',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://localhost:5173',
          'http://localhost:8081', // ✅ React Native Metro Bundler
          'http://127.0.0.1:8081', // ✅ Alternate localhost for React Native
          'http://192.168.200.208:8081', // ✅ Alternate localhost for React Native
          'http://192.168.200.208:8082', // ✅ Alternate localhost for React Native
          'http://192.168.1.238:8081', // ✅ Alternate localhost for React Native
          'http://192.168.1.238:8082', // ✅ Alternate localhost for React Native
        ],
        credentials: true,
      }
      app.use(cors(corsOptions))
    }

    app.all('*', setupAsyncLocalStorage)

    // Routes
    app.use('/api/auth', authRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/room', roomRoutes)
    app.use('/api/chat', chatRoutes)

    // Setup Socket.IO
    await setupSocketAPI(server)
    console.log('✅ Socket.IO setup complete')

    // Serve frontend in production
    app.get('/**', (req, res) => {
      res.sendFile(path.resolve('public/index.html'))
    })

    // Database connection
    const connectDB = async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGO_URL as string)
        logger.info(`MongoDB Connected: ${conn.connection.host}`)
      } catch (error) {
        logger.error('Error connecting to MongoDB:', error)
        process.exit(1)
      }
    }

    // Start server
    const port = process.env.PORT || 3030

    connectDB().then(() => {
      server.listen(port, () => {
        logger.info('Server is running on port: ' + port)
      })
    })
  } catch (err) {
    logger.error('Failed to initialize server', err)
    process.exit(1)
  }
}
