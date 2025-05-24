import { Room, IRoom } from './room.model'
import { logger } from '../../services/logger.service'

export class RoomService {
  static async query(filterBy: { txt?: string; hostId?: string } = {}) {
    try {
      const rooms = await Room.findMany({
        // where: {
        //   OR: [
        //     { access_code: { contains: filterBy.txt, mode: 'insensitive' } },
        //     { host_id: { contains: filterBy.userId, mode: 'insensitive' } },
        //   ],
        // },
      })
      return rooms
    } catch (err) {
      logger.error('Failed to query rooms', err)
      throw err
    }
  }

  static async getById(roomId: string) {
    try {
      const addRoom = await Room.findUnique({
        where: { id: roomId },
      })
      return addRoom
    } catch (err) {
      logger.error(`Failed to get addRoom ${roomId}`, err)
      throw err
    }
  }

  static async remove(roomId: string) {
    try {
      await Room.delete({
        where: { id: roomId },
      })
    } catch (err) {
      logger.error(`Failed to remove user ${roomId}`, err)
      throw err
    }
  }

  static async update(roomId: string, roomToUpdate: Partial<IRoom>) {
    try {
      const room = await Room.update({
        where: { id: roomId },
        data: roomToUpdate,
      })
      return room
    } catch (err) {
      logger.error(`Failed to update room ${roomId}`, err)
      throw err
    }
  }
}
