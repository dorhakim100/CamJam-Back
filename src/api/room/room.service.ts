import { Room, RRoom } from './room.model'
import { logger } from '../../services/logger.service'

export class RoomService {
  static async query(filterBy = {}) {
    try {
      const rooms = await Room.find(filterBy).populate(
        'createdBy',
        'name email'
      )
      return rooms
    } catch (err) {
      logger.error('Failed to query rooms', err)
      throw err
    }
  }

  static async getById(roomId: string) {
    try {
      const room = await Room.findById(roomId).populate(
        'createdBy',
        'name email'
      )
      return room
    } catch (err) {
      logger.error(`Failed to get room ${roomId}`, err)
      throw err
    }
  }

  static async add(room: Partial<RRoom>) {
    try {
      const addedRoom = await Room.create(room)
      return addedRoom
    } catch (err) {
      logger.error('Failed to add room', err)
      throw err
    }
  }

  static async update(roomId: string, roomToUpdate: Partial<RRoom>) {
    try {
      const room = await Room.findByIdAndUpdate(roomId, roomToUpdate, {
        new: true,
      })
      return room
    } catch (err) {
      logger.error(`Failed to update room ${roomId}`, err)
      throw err
    }
  }

  static async remove(roomId: string) {
    try {
      await Room.findByIdAndDelete(roomId)
    } catch (err) {
      logger.error(`Failed to remove room ${roomId}`, err)
      throw err
    }
  }
}
