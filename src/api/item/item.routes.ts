import { Router } from 'express'
import { ItemController } from './item.controller'
import { protect } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', ItemController.getItems)
router.get('/:id', ItemController.getItem)
router.post('/', protect, ItemController.addItem)
router.put('/:id', protect, ItemController.updateItem)
router.delete('/:id', protect, ItemController.deleteItem)

export const itemRoutes = router
