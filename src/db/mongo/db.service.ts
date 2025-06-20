import { MongoClient } from 'mongodb'

import { config } from '../config/index'
// import { logger } from './logger.service'
import { logger } from '../../services/logger.service'

export const dbService = { getCollection }

var dbConn: any = null

async function getCollection(collectionName: string) {
  try {
    const db = await _connect()
    const collection = await db.collection(collectionName)
    return collection
  } catch (err) {
    logger.error('Failed to get Mongo collection', err)
    throw err
  }
}

async function _connect() {
  if (dbConn) return dbConn

  try {
    if (!config) throw new Error(`Couldn't connect to database`)
    const client = await MongoClient.connect(config.dbURL)
    return (dbConn = client.db(config.dbName))
  } catch (err) {
    logger.error('Cannot Connect to DB', err)
    throw err
  }
}
