import { getDb } from "./mongo.js";
import { ObjectId } from "mongodb";

const COLLECTION = "trips";

// Create/insert a new trip
export async function createTrip(doc) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  try {
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    const res = await trips.insertOne(doc);
    return await trips.findOne({ _id: res.insertedId });
  } catch (error) {
    console.error("Error creating trip:", error);
    throw error;
  }
}

// Get all trips for a specific user
export async function getTrips({
  userId,
  tripId,
  pageSize = 20,
  page = 0,
} = {}) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);
  const filter = {};
  if (userId) filter.userId = userId;
  if (tripId) filter.tripId = tripId;

  return await trips
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * page)
    .toArray();
}

// Get a specific trip by its ID
export async function getTrip(tripId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);
  return await trips.findOne({ _id: tripId });
}

// Update a specific trip by its ID
export async function updateTrip(tripId, updates) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  //console.log("Updating trip:", tripId, updates);
  updates.updatedAt = new Date();

  const result = await trips.findOneAndUpdate(
    { _id: tripId },
    { $set: updates },
    { returnDocument: "after" }
  );
  //console.log("Updated trip result:", result);
  return result;
}

// Delete a specific trip by its ID
export async function deleteTrip(tripId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  const result = await trips.deleteOne({ _id: tripId });
  return result.deletedCount === 1;
}

//Destinations CRUD

// Add a destination to a specific trip
export async function addDestinationToTrip(tripId, destination) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  try {
    const result = await trips.findOneAndUpdate(
      { _id: tripId },
      { $push: { destinations: destination }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding destination to trip:", error);
    throw error;
  }
}

// Get all destinations for a specific trip
export async function getDestinations(tripId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  try {
    const trip = await trips.findOne(
      { _id: new ObjectId(tripId) },
      { projection: { destinations: 1 } }
    );
    return trip?.destinations || [];
  } catch (error) {
    console.error("Error fetching destinations for trip:", error);
    throw error;
  }
}

// Update a destination by its ID within a specific trip
export async function updateDestination(tripId, destinationId, updates) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  try {
    const result = await trips.findOneAndUpdate(
      {
        _id: new ObjectId(tripId),
        "destinations._id": new ObjectId(destinationId),
      },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [
            `destinations.$.${key}`,
            value,
          ])
        ),
      },
      { returnDocument: "after" }
    );
    return result.value;
  } catch (error) {
    console.error("Error updating destination:", error);
    throw error;
  }
}

// Delete a destination by its ID within a specific trip
export async function deleteDestination(tripId, destinationId) {
  const db = await getDb();
  const trips = db.collection(COLLECTION);

  try {
    const result = await trips.findOneAndUpdate(
      { _id: tripId },
      { $pull: { destinations: { _id: destinationId } } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error deleting destination:", error);
    throw error;
  }
}
