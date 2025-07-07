import { MongoClient } from 'mongodb';

const dbUrl = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, 
};

let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  console.log("MongoDB URL:", dbUrl);

  const client = new MongoClient(dbUrl, options);
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}