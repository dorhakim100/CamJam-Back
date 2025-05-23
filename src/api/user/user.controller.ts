import { Request, Response } from 'express'
import { UserService } from './user.service'
import { logger } from '../../services/logger.service'

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.query()
      res.json(users)
    } catch (err: any) {
      logger.error('Failed to get users', err)
      res.status(500).send({ err: 'Failed to get users' })
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const user = await UserService.getById(req.params.id)
      res.json(user)
    } catch (err: any) {
      logger.error('Failed to get user', err)
      res.status(500).send({ err: 'Failed to get user' })
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await UserService.update(req.params.id, req.body)
      res.json(user)
    } catch (err: any) {
      logger.error('Failed to update user', err)
      res.status(500).send({ err: 'Failed to update user' })
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.remove(req.params.id)
      res.send({ msg: 'Deleted successfully' })
    } catch (err: any) {
      logger.error('Failed to delete user', err)
      res.status(500).send({ err: 'Failed to delete user' })
    }
  }
}
