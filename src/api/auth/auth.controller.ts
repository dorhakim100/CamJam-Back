import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { logger } from '../../services/logger.service'

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body
    try {
      const user = await AuthService.login(email, password)
      const loginToken = AuthService.getLoginToken(user)

      res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true })
      res.json(user)
    } catch (err: any) {
      logger.error('Failed to Login ' + err)
      res.status(401).send({ err: 'Failed to Login' })
    }
  }

  static async signup(req: Request, res: Response) {
    try {
      const credentials = req.body
      const account = await AuthService.signup(credentials)
      const loginToken = AuthService.getLoginToken(account)

      res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true })
      res.json(account)
    } catch (err: any) {
      logger.error('Failed to signup ' + err)
      res.status(400).send({ err: 'Failed to signup' })
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie('loginToken')
      res.send({ msg: 'Logged out successfully' })
    } catch (err: any) {
      res.status(500).send({ err: 'Failed to logout' })
    }
  }
}
