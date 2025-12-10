import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";

async function getUserCollection() {
  const db = await getDb();
  return db.collection("users");
}

// For auth: include passwordHash
export async function findUserByEmailWithPassword(email) {
  const users = await getUserCollection();
  return users.findOne({
    email: email.trim().toLowerCase(),
  });
}

// For general use: hide passwordHash
export async function findUserByEmail(email) {
  const users = await getUserCollection();
  return users.findOne(
    { email: email.trim().toLowerCase() },
    { projection: { passwordHash: 0 } }
  );
}

export async function findUserById(id) {
  const users = await getUserCollection();
  return users.findOne(
    { _id: new ObjectId(id) },
    { projection: { passwordHash: 0 } }
  );
}

export async function emailExists(email) {
  const users = await getUserCollection();
  const existing = await users.findOne({
    email: email.trim().toLowerCase(),
  });
  return !!existing;
}

export async function createUser(doc) {
  const users = await getUserCollection();
  const now = new Date();

  const insertDoc = {
    name: doc.name.trim(),
    email: doc.email.trim().toLowerCase(),
    passwordHash: doc.passwordHash, // hashed already
    visitedStates: doc.visitedStates || [],
    createdAt: now,
    updatedAt: now,
  };

  const res = await users.insertOne(insertDoc);
  const created = await users.findOne(
    { _id: res.insertedId },
    { projection: { passwordHash: 0 } }
  );
  return created;
}

export async function updateUser(id, updateData) {
  const users = await getUserCollection();
  const now = new Date();

  const toSet = {
    ...updateData,
    updatedAt: now,
  };

  await users.updateOne({ _id: new ObjectId(id) }, { $set: toSet });

  return users.findOne(
    { _id: new ObjectId(id) },
    { projection: { passwordHash: 0 } }
  );
}
