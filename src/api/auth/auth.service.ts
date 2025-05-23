import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, IUser, ICreateUser } from '../user/user.model'
import { logger } from '../../services/logger.service'

export class AuthService {
  static async login(
    email: string,
    password: string,
    isRemember: boolean
  ): Promise<IUser> {
    const user = await User.findByEmail(email)
    if (!user) throw new Error('Invalid email or password')
    if (isRemember) return user
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid email or password')

    return user
  }

  static async signup(credentials: ICreateUser): Promise<IUser> {
    logger.debug(`Auth.signup: ${credentials.email}`)

    if (!credentials.email || !credentials.password || !credentials.fullname)
      throw new Error('Missing required signup information')

    // const userExist = await User.findByEmail(credentials.email)
    // console.log(userExist)

    // if (userExist) throw new Error('Email already exists')

    return User.createWithHash(credentials)
  }

  static getLoginToken(user: IUser) {
    const userInfo = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
    }

    return jwt.sign(
      userInfo,
      (process.env.JWT_SECRET as string) || 'Secret-Puk-1234',
      {
        expiresIn: '7d',
      }
    )
    // return cryptr.encrypt(JSON.stringify(userInfo))
  }
}
