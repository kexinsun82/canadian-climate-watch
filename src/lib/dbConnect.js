import mongoose from 'mongoose';

const dbUrl = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DB_HOST}/${process.env.DB_NAME}?${process.env.DB_OPTIONS || ''}`;

if (!process.env.DBUSER || !process.env.DBPWD || !process.env.DB_HOST || !process.env.DB_NAME) {
  throw new Error('Please define DBUSER, DBPWD, DB_HOST, and DB_NAME environment variables inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("MongoDB URL:", dbUrl);

    cached.promise = mongoose.connect(dbUrl, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB via Mongoose');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection failed:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 