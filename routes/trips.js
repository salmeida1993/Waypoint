import express from "express";
import * as tripsDB from "../db/tripsDB.js";
import { geoLookup } from "../services/geoLookup.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Create a new trip for a user
// POST /api/trips/userId/:userId
router.post("/userId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const {
      title,
      startDate = null,
      endDate = null,
      destinations = [],
      expenses = {},
      notes = "",
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const trip = await tripsDB.createTrip({
      userId,
      title: title.trim(),
      startDate,
      endDate,
      destinations,
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
// GET /api/trips?userId=...
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const trips = await tripsDB.getTrips(userId);
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// Get single trip
// GET /api/trips/:tripId
router.get("/:tripId", async (req, res) => {
  try {
    const trip = await tripsDB.getTrip(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

// Update trip
// PATCH /api/trips/:tripId
router.patch("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      title,
      startDate = null,
      endDate = null,
      destinations,
      expenses,
      notes,
    } = req.body || {};

    const update = {};
    if (title !== undefined) update.title = title;
    if (startDate !== undefined) update.startDate = startDate;
    if (endDate !== undefined) update.endDate = endDate;
    if (destinations !== undefined) update.destinations = destinations;
    if (expenses !== undefined) update.expenses = expenses;
    if (notes !== undefined) update.notes = notes;

    const updated = await tripsDB.updateTrip(tripId, update);
    if (!updated) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// Delete trip
// DELETE /api/trips/:tripId
router.delete("/:tripId", async (req, res) => {
  try {
    const deleted = await tripsDB.deleteTrip(req.params.tripId);
    if (!deleted) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

// Update a single destination
// PATCH /api/trips/:tripId/destinations/:destinationId
router.patch("/:tripId/destinations/:destinationId", async (req, res) => {
  try {
    const { tripId, destinationId } = req.params;
    const update = req.body || {};

    const updatedTrip = await tripsDB.updateDestination(
      tripId,
      destinationId,
      update
    );
    if (!updatedTrip) {
      return res.status(404).json({ error: "Trip or destination not found" });
    }

    res.json(updatedTrip);
  } catch (error) {
    console.error("Error updating destination:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

// Delete a destination
// DELETE /api/trips/:tripId/destinations/:destinationId
router.delete("/:tripId/destinations/:destinationId", async (req, res) => {
  try {
    const { tripId, destinationId } = req.params;

    const updatedTrip = await tripsDB.deleteDestination(tripId, destinationId);
    if (!updatedTrip) {
      return res.status(404).json({ error: "Trip or destination not found" });
    }

    res.json(updatedTrip);
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

// Add a destination to a trip
// POST /api/trips/:tripId/destinations
router.post("/:tripId/destinations", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { city, state, startDate = null, endDate = null } = req.body || {};

    if (!city || !state) {
      return res.status(400).json({ error: "City and state are required" });
    }

    let coords = null;
    const query = `${city}, ${state}`;
    try {
      coords = await geoLookup(query);
    } catch (err) {
      console.error("Geo lookup failed:", err);
    }

    const destination = {
      city,
      state,
      startDate,
      endDate,
      coords,
    };

    const updatedTrip = await tripsDB.addDestinationToTrip(tripId, destination);
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
