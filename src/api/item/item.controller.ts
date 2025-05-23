import { Request, Response } from 'express'
import { ItemService } from './item.service'
import { logger } from '../../services/logger.service'

export class ItemController {
  static async getItems(req: Request, res: Response) {
    try {
      const items = await ItemService.query(req.query)
      res.json(items)
    } catch (err: any) {
      logger.error('Failed to get items', err)
      res.status(500).send({ err: 'Failed to get items' })
    }
  }

  static async getItem(req: Request, res: Response) {
    try {
      const item = await ItemService.getById(req.params.id)
      res.json(item)
    } catch (err: any) {
      logger.error('Failed to get item', err)
      res.status(500).send({ err: 'Failed to get item' })
    }
  }

  static async addItem(req: Request, res: Response) {
    try {
      const item = req.body
      item.createdBy = req.user.id
      const addedItem = await ItemService.add(item)
      res.json(addedItem)
    } catch (err: any) {
      logger.error('Failed to add item', err)
      res.status(500).send({ err: 'Failed to add item' })
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const item = await ItemService.update(req.params.id, req.body)
      res.json(item)
    } catch (err: any) {
      logger.error('Failed to update item', err)
      res.status(500).send({ err: 'Failed to update item' })
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      await ItemService.remove(req.params.id)
      res.send({ msg: 'Deleted successfully' })
    } catch (err: any) {
      logger.error('Failed to delete item', err)
      res.status(500).send({ err: 'Failed to delete item' })
    }
  }
}
