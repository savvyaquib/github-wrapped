import mongoose from 'mongoose';

/**
 * Next.js API routes run in a serverless environment. 
 * This means every API call could potentially spin up a new instance of the function,
 * connecting to the database each time. In a high-traffic scenario, or even during 
 * local development with hot-reloading, this can quickly exhaust the MongoDB connection pool.
 * 
 * To prevent this, we cache the Mongoose connection on the `global` object.
 * In Node.js, `global` persists across module reloads in development.
 * If a cached connection exists, we reuse it; otherwise, we create a new one and cache it.
 */

// Define the structure of our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Augment the global scope to include our mongoose cache.
// We use `var` because `let` and `const` do not attach to the `global` object in TypeScript.
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Fallback to an empty cache if it doesn't exist on `global` yet
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have an active connection, return it immediately
  if (cached?.conn) {
    return cached.conn;
  }

  // If a connection promise is not already in flight, create one
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to resolve and store it
    cached!.conn = await cached!.promise;
  } catch (e) {
    // If it fails, clear the promise so we can try again on the next request
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
