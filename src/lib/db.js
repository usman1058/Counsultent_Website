// src/lib/db.js
const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query'],
})

const db = globalForPrisma.prisma
module.exports = { db }
