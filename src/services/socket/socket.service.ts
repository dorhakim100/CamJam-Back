import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { logger } from '../logger.service'

export const setupSocketAPI = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? false
          : ['http://127.0.0.1:3000', 'http://localhost:3000'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`)

    socket.on('join-room', (room: string) => {
      if (socket.rooms.has(room)) return
      socket.join(room)
      logger.info(`Client: ${socket.id} joined room: ${room}`)
    })

    socket.on('leave-room', (room: string) => {
      socket.leave(room)
      logger.info(`Client: ${socket.id} left room: ${room}`)
    })

    socket.on('chat-send-msg', (data: { room: string; msg: any }) => {
      logger.info(
        `New chat msg from socket [${socket.id}] in room [${data.room}]`
      )
      io.to(data.room).emit('chat-add-msg', data.msg)
    })

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
    })
  })
}
