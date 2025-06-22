import { Router } from 'express'
import { getChatByRoomId, addChat, addMessage } from './chat.controller'

const router = Router()

router.post('/message', addMessage)
// router.post('/message/:messageId', updateMessage)
router.get('/:roomId', getChatByRoomId)
router.post('/', addChat)

export const chatRoutes = router
