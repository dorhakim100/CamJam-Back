import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../api/user/user.model'

interface JWTPayload {
  id: string
  email: string
  fullname: string
  iat: number
  exp: number
}

interface AuthRequest extends Request {
  user?: JWTPayload
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTPayload

      // Add user from payload
      req.user = decoded

      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
      return
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
    return
  }
}
