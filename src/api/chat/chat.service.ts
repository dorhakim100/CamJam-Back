import { ObjectId } from 'mongodb'
import { dbService } from '../../db/mongo/db.service'

export interface Chat {
  _id?: string
  roomId: string
  messages: string[] // array of messageId strings
}

const COLLECTION = 'chat'

export async function getChatByRoomIdService(
  roomId: string
): Promise<Chat | null> {
  const collection = await dbService.getCollection(COLLECTION)
  const chat = await collection.findOne({ roomId })
  if (!chat) return null
  chat._id = chat._id.toString()
  return chat as Chat
}

export async function addChatService(chatData: Chat): Promise<Chat> {
  const collection = await dbService.getCollection(COLLECTION)
  const { insertedId } = await collection.insertOne({
    roomId: chatData.roomId,
    messages: chatData.messages,
  })
  return { _id: insertedId.toString(), ...chatData }
}
