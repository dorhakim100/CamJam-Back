import { PrismaClient, Room as PrismaRoom } from '@prisma/client'

const prisma = new PrismaClient()
export interface ICreateRoom {
  host_id: string
  is_private: boolean
  max_participants?: number
  created_at: number
  name: string
}

export type IRoom = PrismaRoom

export const Room = {
  ...prisma.room,

  async create(data: ICreateRoom): Promise<IRoom> {
    return await prisma.room.create({ data: data })
  },
}
