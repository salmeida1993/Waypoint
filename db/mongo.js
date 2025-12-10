import dotenv from "dotenv";
dotenv.config();
import { MongoClient, ObjectId } from "mongodb";

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB || "tripTracker";

if (!URI) {
  throw new Error("MONGO_URI environment variable not set");
}

let client;
let db;

export async function getDb() {
  if (db) return db;

  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB database: ${DB_NAME}`);
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && id.length === 24) return new ObjectId(id);
  if (typeof id === "object" && id.$oid) return new ObjectId(id.$oid);
  throw new Error(`Invalid ObjectId: ${JSON.stringify(id)}`);
}
