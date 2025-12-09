import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";

export async function getUserCollection() {
  const db = await getDb();
  return db.collection("users");
}

export async function findUserByEmail(email) {
  const users = await getUserCollection();
  return users.findOne({ email: email.trim().toLowerCase() });
}

export async function findUserById(id) {
  const users = await getUserCollection();
  return users.findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });
}

export async function createUser(doc) {
  const users = await getUserCollection();
  const result = await users.insertOne(doc);
  return {
    _id: result.insertedId,
    ...doc,
  };
}

export async function emailExists(email) {
  const users = await getUserCollection();
  return users.findOne({ email: email.trim().toLowerCase() });
}

export async function updateUser(id, updateData) {
  const users = await getUserCollection();
  return users.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
}
