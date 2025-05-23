import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../user/user.model'
import { logger } from '../../services/logger.service'

export class AuthService {
  static async login(email: string, password: string): Promise<IUser> {
    const user = await User.findOne({ email })
    if (!user) throw new Error('Invalid email or password')

    if (!user.password) {
      throw new Error('Invalid email or password')
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid email or password')

    delete user.password
    return user
  }

  static async signup(credentials: {
    email: string
    password: string
    name: string
  }): Promise<IUser> {
    const saltRounds = 10
    logger.debug(`Auth.signup: ${credentials.email}`)

    if (!credentials.email || !credentials.password || !credentials.name)
      throw new Error('Missing required signup information')

    const userExist = await User.findOne({ email: credentials.email })
    if (userExist) throw new Error('Email already exists')

    const hash = await bcrypt.hash(credentials.password, saltRounds)
    credentials.password = hash

    const user = await User.create(credentials)
    delete user.password
    return user
  }

  static getLoginToken(user: IUser) {
    const userInfo = { _id: user._id, name: user.name, email: user.email }
    return jwt.sign(userInfo, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    })
  }
}
