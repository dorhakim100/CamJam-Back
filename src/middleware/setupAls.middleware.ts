import { Request, Response, NextFunction } from 'express'
import { AsyncLocalStorage } from 'async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

export function setupAsyncLocalStorage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const storage = { loggedinUser: null }
  asyncLocalStorage.run(storage, () => {
    next()
  })
}

export const getLoggedinUser = () => {
  const storage = asyncLocalStorage.getStore() as { loggedinUser: any } | null
  return storage?.loggedinUser
}

export const setLoggedinUser = (user: any) => {
  const storage = asyncLocalStorage.getStore() as { loggedinUser: any } | null
  if (storage) storage.loggedinUser = user
}
