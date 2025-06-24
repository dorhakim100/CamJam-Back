import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../api/user/user.model'
import { asyncLocalStorage, getLoggedinUser } from './setupAls.middleware'

interface JWTPayload {
  id: string
  email: string
  fullname: string
  iat: number
  exp: number
  isGuest?: boolean
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

  const loginToken = req.cookies.loginToken

  if (
    // req.headers.authorization &&
    // req.headers.authorization.startsWith('Bearer')
    loginToken
  ) {
    try {
      // Get token from header
      // token = req.headers.authorization.split(' ')[1]
      token = loginToken
      // Verify token

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTPayload

      if (decoded.isGuest)
        res.status(401).json({ message: 'Not authorized, token failed' })

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

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const loginToken = req.cookies.loginToken
  console.log(req.cookies)

  if (!loginToken) return res.status(401).send('Not Authenticated')
  const token = loginToken
  // Verify token

  const loggedinUser = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JWTPayload

  if (!loggedinUser) return res.status(401).send('Not Authenticated')

  const { id, userId } = req.body

  if (id !== loggedinUser.id) return res.status(401).send('Not Authenticated')

  // if (config.isGuestMode && !loggedinUser) {
  //   req.loggedinUser = { _id: '', fullname: 'Guest' }
  //   return next()
  // }
  next()
}
