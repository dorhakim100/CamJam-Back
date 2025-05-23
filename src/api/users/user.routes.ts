import { Router } from 'express'
import { UserController } from './user.controller'
import { protect } from '../../middleware/auth.middleware'

const router = Router()

// Public routes
router.post('/register', UserController.register)
router.post('/login', UserController.login)

// Protected routes
router.get('/profile', protect, UserController.getProfile)
router.put('/profile', protect, UserController.updateProfile)
router.delete('/profile', protect, UserController.deleteProfile)

export default router
