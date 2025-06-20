import { Router } from 'express'
import { RoomController } from './room.controller'
import { protect, requireAuth } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', RoomController.getRooms)
router.get('/:id', RoomController.getRoom)
router.post('/', protect, RoomController.addRoom)
router.put('/:id', protect, RoomController.updateRoom)
router.delete('/:id', requireAuth, RoomController.deleteRoom)

export const roomRoutes = router
