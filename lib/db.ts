import 'server-only'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

export const isDbConfigured = Boolean(uri)

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const globalForMongo = globalThis as unknown as { __mongo?: Cache }
const cache: Cache = (globalForMongo.__mongo ??= { conn: null, promise: null })

/** Single cached connection per server instance (survives hot reload and warm serverless invocations). */
export async function connectDb() {
  if (!uri) throw new Error('MONGODB_URI is not configured')
  if (cache.conn) return cache.conn
  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  })
  try {
    cache.conn = await cache.promise
  } catch (err) {
    cache.promise = null
    throw err
  }
  return cache.conn
}
