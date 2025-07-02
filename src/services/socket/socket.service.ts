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
      try {
        if (socket.rooms.has(room)) return
        socket.join(room)
        logger.info(`Client: ${socket.id} joined room: ${room}`)
        await pubClient.sAdd(`room:${room}:members`, socket.id)

        // Fetch current members with error handling
        const memberIds = await pubClient.sMembers(`room:${room}:members`)
        const members = await Promise.all(
          memberIds.map(async (id) => {
            try {
              let retrivedUser = await pubClient.get(`user:${id}`)
              if (!retrivedUser) return null
              const user = JSON.parse(retrivedUser)
              return { ...user, socketId: id }
            } catch (error) {
              logger.error(`Error fetching user ${id}:`, error)
              return null
            }
          })
        )

        // Filter out null members before emitting
        const validMembers = members.filter(Boolean)

        io.to(room).emit('members-change', validMembers)
      } catch (error) {
        logger.error(`Error in join-room handler:`, error)
      }
    })

    socket.on(
      'set-user-socket',
      async (user: {
        id: string
        name: string
        imgUrl: string
        isVideoOn: Boolean | null
        isAudioOn: Boolean | null
      }) => {
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
          if (!retrivedUser) return null
          const user = JSON.parse(retrivedUser)
          return { ...user, socketId: id }
        })
      )

      io.to(room).emit('room-members', members)
      console.log(
        `Client: ${socket.id} leaved room: ${room}, members: ${members.length}`
      )
      let retrivedUser = await pubClient.get(`user:${socket.id}`)
      console.log('retrivedUser:', retrivedUser)
      if (!retrivedUser) throw new Error(`User with ID ${socket.id} not found`)
      const parsedUser = JSON.parse(retrivedUser)

      io.to(room).emit('user-left', parsedUser.id)
      io.to(room).emit('members-change', members)
    })
    socket.on('end-meeting', async (room: string) => {
      socket.leave(room)
      logger.info(`User removed room: ${room}`)
      // await pubClient.sRem(`room:${room}:members`, socket.id)

      io.to(room).emit('end-meeting')
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
        console.log('data: ', data)

        // Identify if 'to' is a socket ID or UUID
        const idType = identifyIdType(to)
        let modifiedTo
        if (idType === 'unknown') {
          logger.error(`Invalid ID format: ${to}`)
          return
        }
        if (idType === 'uuid') {
          // If 'to' is a UUID, we need to fetch the corresponding socket ID
          const userSocketId = await pubClient.get(`userSocket:${to}`)
          if (!userSocketId) {
            logger.error(`User with UUID ${to} not found`)
            return
          }
          modifiedTo = userSocketId
        } else {
          // If 'to' is a socket ID, we can use it directly
          modifiedTo = to
        }

        // logger.info(`🌐 OFFER from ${socket.id} → ${modifiedTo} (room=${room})`)

        // Include the room in the offer data
        socket.to(modifiedTo).emit('offer', {
          from: socket.id,
          offer,
          // room, // Include room in the offer data
        })
      }
    )

    socket.on(
      'answer',
      async (data: {
        to: string
        answer: RTCSessionDescriptionInit
        room: string
      }) => {
        const { to, answer, room } = data
        const idType = identifyIdType(to)
        let modifiedTo
        if (idType === 'unknown') {
          logger.error(`Invalid ID format: ${to}`)
          return
        }
        if (idType === 'uuid') {
          // If 'to' is a UUID, we need to fetch the corresponding socket ID
          const userSocketId = await pubClient.get(`userSocket:${to}`)
          if (!userSocketId) {
            logger.error(`User with UUID ${to} not found`)
            return
          }
          modifiedTo = userSocketId
        } else {
          // If 'to' is a socket ID, we can use it directly
          modifiedTo = to
        }

        // logger.info(`🌐 ANSWER from ${socket.id} → ${to} (room=${room})`)
        socket.to(modifiedTo).emit('answer', {
          from: socket.id,
          answer,
          // room, // Include room in answer data
        })
      }
    )

    socket.on(
      'ice-candidate',
      async (data: {
        to: string
        candidate: RTCIceCandidateInit
        room: string
      }) => {
        const { to, candidate, room } = data
        const idType = identifyIdType(to)
        let modifiedTo
        if (idType === 'unknown') {
          logger.error(`Invalid ID format: ${to}`)
          return
        }
        if (idType === 'uuid') {
          // If 'to' is a UUID, we need to fetch the corresponding socket ID
          const userSocketId = await pubClient.get(`userSocket:${to}`)
          if (!userSocketId) {
            logger.error(`User with UUID ${to} not found`)
            return
          }
          modifiedTo = userSocketId
        } else {
          // If 'to' is a socket ID, we can use it directly
          modifiedTo = to
        }
        // logger.info(
        //   `🌐 ICE-CANDIDATE from ${socket.id} → ${modifiedTo} (room=${room})`
        // )
        socket.to(modifiedTo).emit('ice-candidate', {
          from: socket.id,
          candidate,
          // room, // Include room in ICE candidate data
        })
      }
    )

    socket.on(
      'media-state-changed',
      async (data: {
        roomId: string
        userId: string
        stateToChange: { isVideo: boolean; isAudio: boolean }
      }) => {
        try {
          const { roomId, userId, stateToChange } = data
          console.log('data:', data)
          logger.info(
            `Media state changed from socket [${socket.id}] in room [${data.roomId}]`
          )

          const updatedUser = {
            id: userId,
            isVideoOn: stateToChange.isVideo,
            isAudioOn: stateToChange.isAudio,
          }

          const userSocketId = await pubClient.get(`userSocket:${userId}`)
          let retrivedUser = await pubClient.get(`user:${userSocketId}`)
          if (!retrivedUser) throw new Error(`User with ID ${userId} not found`)
          const parsedUser = JSON.parse(retrivedUser)
          await pubClient.set(
            `user:${socket.id}`,
            JSON.stringify({
              ...parsedUser,
              isVideoOn: stateToChange.isVideo,
              isAudioOn: stateToChange.isAudio,
            })
          )

          io.to(roomId).emit('change-media-state', updatedUser)
        } catch (err) {
          logger.error('Error in media-state-changed:', err)
          throw err
        }
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

function identifyIdType(id: string): 'socket' | 'uuid' | 'unknown' {
  // 1) Check for PostgreSQL UUID (hex digits, with hyphens in 8-4-4-4-12 pattern)
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  if (uuidRegex.test(id)) {
    return 'uuid'
  }

  // 2) Check for Socket.IO’s default ID format:
  //    • exactly 20 characters
  //    • characters from A–Z, a–z, 0–9, “–” or “_” (URL-safe base64 subset)
  const socketIdRegex = /^[A-Za-z0-9_-]{20}$/
  if (socketIdRegex.test(id)) {
    return 'socket'
  }

  // 3) If neither pattern matched, return “unknown”
  return 'unknown'
}
