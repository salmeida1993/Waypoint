import express from "express";
import * as tripsDB from "../db/tripsDB.js";
import { geoLookup } from "../services/geoLookup.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Trips
// Create a new trip
router.post("/trips/userId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      title,
      startDate = null,
      endDate = null,
      destinations = [],
      expenses: {
        transportation = 0,
        food = 0,
        lodging = 0,
        extra = 0,
      },
      notes = "",
    } = req.body;

    const expenses = {
      transportation: transportation,
      food: food,
      lodging: lodging,
      extra: extra,
    };

    const processedDestinations = [];
    for (const destination of destinations) {
      const { city, state, days = 0 } = destination;
      const geo = await geoLookup(`${city}, ${state}`);

      processedDestinations.push({
        _id: new ObjectId(),
        city,
        state,
        days,
        latitude: geo?.lat || null,
        longitude: geo?.lng || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    //console.log("Expenses:", expenses); // DEBUG

    const trip = await tripsDB.createTrip({
      userId,
      title,
      startDate,
      endDate,
      destinations: processedDestinations,
      expenses,
      notes,
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// Get all trips for a user
router.get("/trips", async (req, res) => {
  console.log("GET /trips called");
  try {
    const { userId } = req.query;

    const trips = await tripsDB.getTrips({ userId });
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

//Get a specific trip by ID
router.get("/trips/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    let objectTripId;
    try {
      objectTripId = new ObjectId(tripId);
    } catch {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }
    const trip = await tripsDB.getTrip(objectTripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

// Update a specific trip by ID
router.patch("/trips/:tripId", async (req, res) => {
  console.log("PATCH /trips/:tripId called");
  try {
    const { tripId } = req.params;
    const updates = req.body;

    let objectTripId;
    try {
      objectTripId = new ObjectId(tripId);
    } catch {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }

    delete updates._id; // Prevent changing the _id field
    const updatedTrip = await tripsDB.updateTrip(objectTripId, updates);
    if (!updatedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// Delete a specific trip by ID
router.delete("/trips/:tripId", async (req, res) => {
  console.log("DELETE /trips/:tripId called");
  try {
    const { tripId } = req.params;
    let objectTripId;
    try {
      objectTripId = new ObjectId(tripId);
    } catch {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }
    const deletedTrip = await tripsDB.deleteTrip(objectTripId);
    if (!deletedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

// Destinations
// Update a specific destination of a trip
router.patch("/trips/:tripId/destinations/:destinationId", async (req, res) => {
  try {
    const { tripId, destinationId } = req.params;
    const updates = req.body;
    const updatedDestination = await tripsDB.updateDestination(tripId, destinationId, updates);
    if (!updatedDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.status(200).json(updatedDestination);
  } catch (error) {
    console.error("Error updating destination:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

// Delete a specific destination of a trip
router.delete("/trips/:tripId/destinations/:destinationId", async (req, res) => {
  try {
    const { tripId, destinationId } = req.params;
    let objectTripId;
    let objectDestinationId;
    try {
      objectTripId = new ObjectId(tripId);
      objectDestinationId = new ObjectId(destinationId);
    } catch {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }
    const deletedDestination = await tripsDB.deleteDestination(objectTripId, objectDestinationId);
    if (!deletedDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.status(200).json(deletedDestination);
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

// Add a new destination to a trip
router.post("/trips/:tripId/destinations", async (req, res) => {
  try {
    const { tripId } = req.params;
    let objectTripId;
    try {
      objectTripId = new ObjectId(tripId);
    } catch {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }
    const { city, state, days = 0 } = req.body;
    const geo = await geoLookup(`${city}, ${state}`);

    const destination = {
      _id: new ObjectId(),
      city,
      state,
      days,
      latitude: geo?.lat || null,
      longitude: geo?.lng || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTrip = await tripsDB.addDestinationToTrip(objectTripId, destination);
    if (!updatedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(201).json(updatedTrip);
  } catch (error) {
    console.error("Error adding destination to trip:", error);
    res.status(500).json({ error: "Failed to add destination to trip" });
  }
});

export default router;
