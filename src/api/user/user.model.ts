// src/models/user.model.ts

import { PrismaClient, User as PrismaUser } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

/**
 * TypeScript interface for User creation (without auto-generated fields)
 */
export interface ICreateUser {
  email: string
  password: string
  fullname: string
  imgUrl?: string
}

/**
 * TypeScript type for a complete User record (including auto-generated fields)
 */
export type IUser = PrismaUser

/**
 * User model with extended functionality for user-specific operations
 */
export const User = {
  ...prisma.user,

  /**
   * Create a new user with password hashing
   */
  async createWithHash(data: ICreateUser): Promise<IUser> {
    const hashedPassword = await hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })
    console.log('User created:', user)

    return user
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  },
}
