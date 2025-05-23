import { User, IUser } from './user.model'
import { logger } from '../../services/logger.service'

export class UserService {
  static async query(filterBy: { email?: string; fullname?: string } = {}) {
    try {
      const users = await User.findMany({
        where: {
          OR: [
            { email: { contains: filterBy.email, mode: 'insensitive' } },
            { fullname: { contains: filterBy.fullname, mode: 'insensitive' } },
          ],
        },
      })
      return users
    } catch (err) {
      logger.error('Failed to query users', err)
      throw err
    }
  }

  static async getById(userId: string) {
    try {
      const user = await User.findUnique({
        where: { id: userId },
      })
      return user
    } catch (err) {
      logger.error(`Failed to get user ${userId}`, err)
      throw err
    }
  }

  static async getByEmail(email: string) {
    try {
      const user = await User.findByEmail(email)
      return user
    } catch (err) {
      logger.error(`Failed to get user by email ${email}`, err)
      throw err
    }
  }

  static async remove(userId: string) {
    try {
      await User.delete({
        where: { id: userId },
      })
    } catch (err) {
      logger.error(`Failed to remove user ${userId}`, err)
      throw err
    }
  }

  static async update(userId: string, userToUpdate: Partial<IUser>) {
    try {
      const user = await User.update({
        where: { id: userId },
        data: userToUpdate,
      })
      return user
    } catch (err) {
      logger.error(`Failed to update user ${userId}`, err)
      throw err
    }
  }
}
