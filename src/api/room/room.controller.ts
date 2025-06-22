import { Request, Response } from 'express'
import { RoomService } from './room.service'
import { logger } from '../../services/logger.service'
import { addChatService } from '../chat/chat.service'
import { getChatByRoomId } from '../chat/chat.controller'

export class RoomController {
  static async getRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomService.query(req.query)
      res.json(rooms)
    } catch (err: any) {
      logger.error('Failed to get rooms', err)
      res.status(500).send({ err: 'Failed to get rooms' })
    }
  }

  static async getRoom(req: Request, res: Response) {
    try {
      const roomId = req.params.id
      const room = await RoomService.getById(roomId)
      const roomChat = await getChatByRoomId(roomId)
      res.json({ ...room, chat: roomChat })
    } catch (err: any) {
      logger.error('Failed to get room', err)
      res.status(500).send({ err: 'Failed to get room' })
    }
  }

  static async addRoom(req: Request, res: Response) {
    try {
      const room = req.body

      // room.createdBy = req.user.id
      const addedRoom = await RoomService.add(room)
      const newChat = await RoomController._addChat(addedRoom.id)

      res.json({ ...addedRoom, chat: newChat })
    } catch (err: any) {
      logger.error('Failed to add room', err)
      res.status(500).send({ err: 'Failed to add room' })
    }
  }

  static async _addChat(roomId: string) {
    try {
      const chatToAdd = {
        roomId,
        messages: [],
      }
      const addedChat = await addChatService(chatToAdd)

      return addedChat
    } catch (error) {
      logger.error('Failed to add chat to room', error)
      throw error
    }
  }

  static async updateRoom(req: Request, res: Response) {
    try {
      const room = await RoomService.update(req.params.id, req.body)
      res.json(room)
    } catch (err: any) {
      logger.error('Failed to update room', err)
      res.status(500).send({ err: 'Failed to update room' })
    }
  }

  static async deleteRoom(req: Request, res: Response) {
    try {
      await RoomService.remove(req.params.id)

      res.send({ msg: 'Deleted successfully' })
    } catch (err: any) {
      logger.error('Failed to delete room', err)
      res.status(500).send({ err: 'Failed to delete room' })
    }
  }
}
