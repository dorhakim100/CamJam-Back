import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

import { Server as HttpServer } from 'http'

import { logger } from '../logger.service'

export const setupSocketAPI = async (server: HttpServer) => {
  const pubClient = createClient({ url: process.env.REDIS_URL })
  const subClient = pubClient.duplicate()
  await Promise.all([pubClient.connect(), subClient.connect()])

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  })

  // Use Redis adapter
  io.adapter(createAdapter(pubClient, subClient))

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`)

    socket.on('join-room', async (room: string) => {
      if (socket.rooms.has(room)) return
      socket.join(room)
      logger.info(`Client: ${socket.id} joined room: ${room}`)
      await pubClient.sAdd(`room:${room}:members`, socket.id)
      // Fetch current members
      const memberIds = await pubClient.sMembers(`room:${room}:members`)
      const members = await Promise.all(
        memberIds.map(async (id) => {
          console.log('id:', id)

          let retrivedUser = await pubClient.get(`user:${id}`)
          console.log('retrivedUser:', retrivedUser)

          return retrivedUser ? JSON.parse(retrivedUser) : null
        })
      )
      io.to(room).emit('room-members', members)

      // io.to(room).emit('room-members', members)
      console.log(
        `Client: ${socket.id} joined room: ${room}, members: ${members.length}`
      )

      io.to(room).emit('members-change', members)
    })

    socket.on(
      'set-user-socket',
      async (user: { id: string; name: string; imgUrl: string }) => {
        // Store JSON string for this socket (or user ID)
        console.log(user)

        await pubClient.set(`user:${socket.id}`, JSON.stringify(user))
        await pubClient.set(`userSocket:${user.id}`, socket.id)
      }
    )

    socket.on('user-left', async (room: string) => {
      socket.leave(room)
      logger.info(`Client: ${socket.id} left room: ${room}`)
      await pubClient.sRem(`room:${room}:members`, socket.id)

      // Fetch current members after leaving
      const memberIds = await pubClient.sMembers(`room:${room}:members`)
      const members = await Promise.all(
        memberIds.map(async (id) => {
          let retrivedUser = await pubClient.get(`user:${id}`)
          console.log(id)

          return retrivedUser ? JSON.parse(retrivedUser) : null
        })
      )
      console.log('room: ', room)

      io.to(room).emit('room-members', members)
      console.log(
        `Client: ${socket.id} leaved room: ${room}, members: ${members.length}`
      )

      io.to(room).emit('members-change', members)
    })

    // Just before the socket is disconnected
    socket.on('disconnecting', async () => {
      for (const room of socket.rooms) {
        if (room === socket.id) continue
        await pubClient.sRem(`room:${room}:members`, socket.id)
        const members = await pubClient.sMembers(`room:${room}:members`)
        io.to(room).emit('room-members', members)
      }
    })

    // 7) WEbrtc SIGNALING: forward “offer”, “answer”, and “ice-candidate” to the intended peer
    //    Each handler expects a payload `{ to: <targetSocketId>, ... }`. We use socket.to(to).emit(...)

    socket.on(
      'offer',
      async (data: {
        to: string
        offer: RTCSessionDescriptionInit
        room: string
      }) => {
        const { to, offer, room } = data
        console.log('to: ', to)
        console.log('offer: ', offer)
        logger.info(`room: ${room}`)
        let retrivedUserSocketId = await pubClient.get(`userSocket:${to}`)

        if (!retrivedUserSocketId) {
          logger.error(`User with socket ID ${to} not found`)
          return
        }
        logger.info(
          `🌐 OFFER from ${socket.id} → ${retrivedUserSocketId} (room=${room})`
        )
        // Simply relay the entire offer object to the peer “to”. The peer “to” should have already joined that room.
        socket.to(retrivedUserSocketId).emit('offer', {
          from: socket.id,
          offer,
          room,
        })
      }
    )

    socket.on(
      'answer',
      async (data: { to: string; answer: RTCSessionDescriptionInit }) => {
        const { to, answer } = data
        console.log('to: ', to)

        let retrivedUserSocketId = await pubClient.get(`userSocket:${to}`)

        if (!retrivedUserSocketId) {
          logger.error(`User with socket ID ${to} not found`)
          return
        }

        logger.info(`🌐 ANSWER from ${socket.id} → ${to}`)
        socket.to(retrivedUserSocketId).emit('answer', {
          from: socket.id,
          answer,
        })
      }
    )

    socket.on(
      'ice-candidate',
      async (data: { to: string; candidate: RTCIceCandidateInit }) => {
        const { to, candidate } = data
        console.log('to: ', to)

        let retrivedUserSocketId = await pubClient.get(`userSocket:${to}`)
        console.log('retrivedUserSocketId: ', retrivedUserSocketId)

        if (!retrivedUserSocketId) {
          logger.error(`User with socket ID ${to} not found`)
          return
        }
        // logger.info(
        //   `🌐 ICE from ${socket.id} → ${to} ; candidate: ${JSON.stringify(
        //     candidate
        //   )}`
        // )
        socket.to(retrivedUserSocketId).emit('ice-candidate', {
          from: socket.id,
          candidate,
        })
      }
    )

    socket.on('chat-send-msg', (data: { room: string; msg: any }) => {
      logger.info(
        `New chat msg from socket [${socket.id}] in room [${data.room}]`
      )
      io.to(data.room).emit('chat-add-msg', data.msg)
    })

    // After the socket is disconnected
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
    })
  })

  // Handle Redis errors

  pubClient.on('error', (err) => logger.error('Redis PUB error', err))
  subClient.on('error', (err) => logger.error('Redis SUB error', err))

  process.on('SIGINT', async () => {
    await pubClient.disconnect()
    await subClient.disconnect()
    process.exit(0)
  })
}
