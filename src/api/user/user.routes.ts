import { Router } from 'express'
import { UserController } from './user.controller'
import { protect, requireAuth } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', protect, UserController.getUsers)
router.get('/rememberMe/:id', UserController.getRememberMe)
router.get('/:id', protect, UserController.getUser)
router.put('/:id', requireAuth, UserController.updateUser)
router.delete('/:id', protect, UserController.deleteUser)

export const userRoutes = router
