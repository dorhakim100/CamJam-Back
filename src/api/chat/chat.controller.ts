import { Request, Response } from 'express'
import {
  getChatByRoomIdService,
  addChatService,
  addMessageService,
} from './chat.service'
import { logger } from '../../services/logger.service'

// export async function getChatByRoomId(req: Request, res: Response) {
//   try {
//     const { roomId } = req.params
//     const chat = await getChatByRoomIdService(roomId)
//     res.json(chat)
//   } catch (err: any) {
//     logger.error('Failed to get chat', err)
//     res.status(500).send({ err: 'Failed to get chat' })
//   }
// }

export async function getChatByRoomId(roomId: string) {
  try {
    const chat = await getChatByRoomIdService(roomId)
    return chat
  } catch (err: any) {
    logger.error('Failed to get chat', err)
    throw err
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
export async function addMessage(req: Request, res: Response) {
  try {
    const messageData = req.body
    const newMessage = await addMessageService(messageData)
    res.json(newMessage)
  } catch (err: any) {
    logger.error('Failed to add message', err)
    res.status(500).send({ err: 'Failed to add message' })
  }
}
