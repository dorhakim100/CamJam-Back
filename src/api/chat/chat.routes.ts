import { Router } from 'express'
import { getChatByRoomId, addChat } from './chat.controller'

const router = Router()

router.get('/:roomId', getChatByRoomId)
router.post('/', addChat)

export const chatRoutes = router
