// src/prisma.ts
import { PrismaClient } from '@prisma/client'

// In Node.js with hot-reload (e.g. Nodemon), guard against multiple instances:
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'warn', 'error'], // optional: helpful for debugging
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
