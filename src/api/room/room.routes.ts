import { Router } from 'express'
import { RoomController } from './room.controller'
import { protect } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', RoomController.getRooms)
router.get('/:id', RoomController.getRoom)
router.post('/', protect, RoomController.addRoom)
router.put('/:id', protect, RoomController.updateRoom)
router.delete('/:id', protect, RoomController.deleteRoom)

export const roomRoutes = router
