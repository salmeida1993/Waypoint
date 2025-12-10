import { getDb } from "./mongo.js";
import { ObjectId } from "mongodb";

const COLLECTION = "trips";

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  return new ObjectId(id);
}

// Create/insert a new trip
export async function createTrip(doc) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const now = new Date();
  const insertDoc = {
    userId: toObjectId(doc.userId),
    title: doc.title,
    startDate: doc.startDate ? new Date(doc.startDate) : null,
    endDate: doc.endDate ? new Date(doc.endDate) : null,
    destinations: doc.destinations || [],
    expenses: doc.expenses || {},
    notes: doc.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  const res = await trips.insertOne(insertDoc);
  return trips.findOne({ _id: res.insertedId });
}

export async function getTrips(userId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const query = {};
  if (userId) {
    query.userId = toObjectId(userId);
  }

  return trips.find(query).sort({ startDate: -1, createdAt: -1 }).toArray();
}

export async function getTrip(tripId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  return trips.findOne({ _id: toObjectId(tripId) });
}

export async function updateTrip(tripId, update) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const now = new Date();
  const toSet = {
    ...update,
    updatedAt: now,
  };

  await trips.updateOne({ _id: toObjectId(tripId) }, { $set: toSet });
  return trips.findOne({ _id: toObjectId(tripId) });
}

export async function deleteTrip(tripId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const res = await trips.deleteOne({ _id: toObjectId(tripId) });
  return res.deletedCount > 0;
}

// Destinations

export async function updateDestination(tripId, destinationId, update) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const now = new Date();
  const result = await trips.findOneAndUpdate(
    { _id: toObjectId(tripId), "destinations._id": toObjectId(destinationId) },
    {
      $set: {
        "destinations.$.city": update.city,
        "destinations.$.state": update.state,
        "destinations.$.startDate": update.startDate
          ? new Date(update.startDate)
          : null,
        "destinations.$.endDate": update.endDate
          ? new Date(update.endDate)
          : null,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  return result.value;
}

export async function deleteDestination(tripId, destinationId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const now = new Date();
  const result = await trips.findOneAndUpdate(
    { _id: toObjectId(tripId) },
    {
      $pull: { destinations: { _id: toObjectId(destinationId) } },
      $set: { updatedAt: now },
    },
    { returnDocument: "after" }
  );

  return result.value;
}

export async function addDestinationToTrip(tripId, destination) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const now = new Date();
  const destDoc = {
    _id: new ObjectId(),
    city: destination.city,
    state: destination.state,
    startDate: destination.startDate ? new Date(destination.startDate) : null,
    endDate: destination.endDate ? new Date(destination.endDate) : null,
    coords: destination.coords || null,
  };

  const result = await trips.findOneAndUpdate(
    { _id: toObjectId(tripId) },
    {
      $push: { destinations: destDoc },
      $set: { updatedAt: now },
    },
    { returnDocument: "after" }
  );

  return result.value;
}
