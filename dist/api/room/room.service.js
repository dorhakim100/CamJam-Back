'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RoomService = void 0
const room_model_1 = require('./room.model')
const logger_service_1 = require('../../services/logger.service')
class RoomService {
  static async query(filterBy = {}) {
    try {
      const rooms = await room_model_1.Room.findMany({
        // where: {
        //   OR: [
        //     { access_code: { contains: filterBy.txt, mode: 'insensitive' } },
        //     { host_id: { contains: filterBy.userId, mode: 'insensitive' } },
        //   ],
        // },
        include: {
          // agregate host's fullname
          host: {
            select: { fullname: true },
          },
        },
      })
      // return rooms.map((r) => ({
      //   // Prisma will return agregation wrraped in an object
      //   ...r,
      //   hostFullname: r.host.fullname,
      // }))
      return rooms
    } catch (err) {
      logger_service_1.logger.error('Failed to query rooms', err)
      throw err
    }
  }
  static async getById(roomId) {
    try {
      console.log('roomId: ', roomId)
      const room = await room_model_1.Room.findUnique({
        where: { id: roomId },
        include: {
          host: {
            select: { fullname: true },
          },
        },
      })
      if (!room) return null
      // return {
      //   ...room,
      //   hostFullname: room.host.fullname,
      // }
      return room
    } catch (err) {
      logger_service_1.logger.error(`Failed to get addRoom ${roomId}`, err)
      throw err
    }
  }
  static async remove(roomId) {
    try {
      await room_model_1.Room.delete({
        where: { id: roomId },
      })
    } catch (err) {
      logger_service_1.logger.error(`Failed to remove user ${roomId}`, err)
      throw err
    }
  }
  static async update(roomId, roomToUpdate) {
    try {
      const room = await room_model_1.Room.update({
        where: { id: roomId },
        data: roomToUpdate,
      })
      return room
    } catch (err) {
      logger_service_1.logger.error(`Failed to update room ${roomId}`, err)
      throw err
    }
  }
  static async add(room) {
    try {
      const addedRoom = await room_model_1.Room.create(room)
      return addedRoom
    } catch (err) {
      logger_service_1.logger.error('Failed to add item', err)
      throw err
    }
  }
}
exports.RoomService = RoomService
