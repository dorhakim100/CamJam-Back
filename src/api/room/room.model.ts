import { PrismaClient, Room as PrismaRoom } from '@prisma/client'

const prisma = new PrismaClient()
export interface ICreateRoom {
  host_id: string
  is_private: boolean
  access_code: string
  max_participants?: number
  created_at?: number
  name: string
}

export type IRoom = PrismaRoom

export const Room = {
  ...prisma.room,

  async create(data: ICreateRoom): Promise<IRoom> {
    const room = await prisma.room.create({
      data,
    })
    console.log('Room created:', room)

    return room
  },
}
