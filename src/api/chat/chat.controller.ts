import { Request, Response } from 'express'
import { getChatByRoomIdService, addChatService } from './chat.service'
import { logger } from '../../services/logger.service'

export async function getChatByRoomId(req: Request, res: Response) {
  try {
    const { roomId } = req.params
    const chat = await getChatByRoomIdService(roomId)
    res.json(chat)
  } catch (err: any) {
    logger.error('Failed to get chat', err)
    res.status(500).send({ err: 'Failed to get chat' })
  }
}

export async function addChat(req: Request, res: Response) {
  try {
    const chatData = req.body
    const newChat = await addChatService(chatData)
    res.json(newChat)
  } catch (err: any) {
    logger.error('Failed to add chat', err)
    res.status(500).send({ err: 'Failed to add chat' })
  }
}
