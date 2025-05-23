import { Request, Response } from 'express'
import { UserService } from './user.service'

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body)
      res.status(201).json(user)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const { user, token } = await UserService.loginUser(email, password)
      res.json({ user, token })
    } catch (error: any) {
      res.status(401).json({ message: error.message })
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.user.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json(user)
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const user = await UserService.updateUser(req.user.id, req.body)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json(user)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  static async deleteProfile(req: Request, res: Response) {
    try {
      const user = await UserService.deleteUser(req.user.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json({ message: 'User deleted successfully' })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
}
