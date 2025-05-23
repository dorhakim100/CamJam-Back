import { User, IUser } from './user.model'
import jwt from 'jsonwebtoken'

export class UserService {
  static async createUser(userData: {
    email: string
    password: string
    name: string
  }): Promise<IUser> {
    const userExists = await User.findOne({ email: userData.email })
    if (userExists) {
      throw new Error('User already exists')
    }

    return User.create(userData)
  }

  static async loginUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    return { user, token }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id)
  }

  static async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true })
  }

  static async deleteUser(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id)
  }
}
