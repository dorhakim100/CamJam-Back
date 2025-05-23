import { Item, IItem } from './item.model'
import { logger } from '../../services/logger.service'

export class ItemService {
  static async query(filterBy = {}) {
    try {
      const items = await Item.find(filterBy).populate(
        'createdBy',
        'name email'
      )
      return items
    } catch (err) {
      logger.error('Failed to query items', err)
      throw err
    }
  }

  static async getById(itemId: string) {
    try {
      const item = await Item.findById(itemId).populate(
        'createdBy',
        'name email'
      )
      return item
    } catch (err) {
      logger.error(`Failed to get item ${itemId}`, err)
      throw err
    }
  }

  static async add(item: Partial<IItem>) {
    try {
      const addedItem = await Item.create(item)
      return addedItem
    } catch (err) {
      logger.error('Failed to add item', err)
      throw err
    }
  }

  static async update(itemId: string, itemToUpdate: Partial<IItem>) {
    try {
      const item = await Item.findByIdAndUpdate(itemId, itemToUpdate, {
        new: true,
      })
      return item
    } catch (err) {
      logger.error(`Failed to update item ${itemId}`, err)
      throw err
    }
  }

  static async remove(itemId: string) {
    try {
      await Item.findByIdAndDelete(itemId)
    } catch (err) {
      logger.error(`Failed to remove item ${itemId}`, err)
      throw err
    }
  }
}
