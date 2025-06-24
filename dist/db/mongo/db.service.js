"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../config/index");
// import { logger } from './logger.service'
const logger_service_1 = require("../../services/logger.service");
exports.dbService = { getCollection };
var dbConn = null;
async function getCollection(collectionName) {
    try {
        const db = await _connect();
        const collection = await db.collection(collectionName);
        return collection;
    }
    catch (err) {
        logger_service_1.logger.error('Failed to get Mongo collection', err);
        throw err;
    }
}
async function _connect() {
    if (dbConn)
        return dbConn;
    try {
        if (!index_1.config)
            throw new Error(`Couldn't connect to database`);
        const client = await mongodb_1.MongoClient.connect(index_1.config.dbURL);
        return (dbConn = client.db(index_1.config.dbName));
    }
    catch (err) {
        logger_service_1.logger.error('Cannot Connect to DB', err);
        throw err;
    }
}
