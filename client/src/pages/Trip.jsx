// client/src/pages/Trip.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "react-bootstrap";
import USMap from "../components/trips/USMap.jsx";
import TripFormModal from "../components/trips/TripFormModal.jsx";
import TripAccordion from "../components/trips/TripAccordion.jsx";
import TripStats from "../components/trips/TripStats.jsx";
import TripFilters from "../components/trips/TripFilters.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function getVisitedStates(trips) {
  const states = new Set();
  trips.forEach((trip) => {
    (trip.destinations ?? []).forEach((destination) => {
      if (destination.state) states.add(destination.state);
    });
  });
  return Array.from(states);
}

function getTotalExpense(trip) {
  if (!trip.expenses) return 0;
  return Object.values(trip.expenses).reduce(
    (sum, val) => sum + Number(val || 0),
    0
  );
}

export default function Trip() {
  const { user } = useAuth();
  const userId = user?._id;

  const [showTripForm, setShowTripForm] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [sortFilter, setSortFilter] = useState("none");
  const [stateFilter, setStateFilter] = useState("");
  const [maxExpense, setMaxExpense] = useState("");

  // Load trips when we know the userId
  useEffect(() => {
    if (!userId) return;

    async function loadTrips() {
      try {
        const res = await fetch(`/api/trips?userId=${userId}`);
        if (!res.ok) {
          console.error("Failed to fetch trips", res.status);
          return;
        }
        const data = await res.json();

        setTrips(data);
      } catch (error) {
        console.error("Error loading trips:", error);
      }
    }

    loadTrips();
  }, [userId]);

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setShowTripForm(true);
  };

  const handleSaveTrip = async (trip) => {
    if (!userId) return;

    try {
      let savedTrip;
      if (trip._id) {
        // Edit existing trip

        const response = await fetch(`/api/trips/${trip._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trip),
        });
        if (!response.ok) {
          console.error("Failed to update trip");
          return;
        }
        savedTrip = await response.json();
        setTrips((prev) =>
          prev.map((t) => (t._id === savedTrip._id ? savedTrip : t))
        );
      } else {
        // Add new trip

        const response = await fetch(`/api/trips/userId/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trip),
        });
        if (!response.ok) {
          console.error("Failed to create trip");
          return;
        }
        savedTrip = await response.json();
        setTrips((prev) => [...prev, savedTrip]);
      }
      setSelectedTrip(null);
      setShowTripForm(false);
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  const handleDeleteTrip = (trip) => {
    if (
      !window.confirm(
        `Delete trip "${trip.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    if (!trip._id) return;

    fetch(`/api/trips/${trip._id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setTrips((prev) => prev.filter((t) => t._id !== trip._id));
        } else {
          console.error("Failed to delete trip");
        }
      })
      .catch((err) => {
        console.error("Error deleting trip:", err);
      });
  };

  const visitedStates = getVisitedStates(trips);

  const filteredTrips = useMemo(() => {
    let t = [...trips];

    if (sortFilter === "latest") {
      t.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (sortFilter === "earliest") {
      t.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sortFilter === "highestExpense") {
      t.sort((a, b) => getTotalExpense(b) - getTotalExpense(a));
    } else if (sortFilter === "lowestExpense") {
      t.sort((a, b) => getTotalExpense(a) - getTotalExpense(b));
    }

    if (maxExpense !== "") {
      t = t.filter((trip) => getTotalExpense(trip) <= Number(maxExpense));
    }

    if (stateFilter !== "") {
      t = t.filter((trip) =>
        trip.destinations?.some(
          (destination) => destination.state === stateFilter
        )
      );
    }

    return t;
  }, [trips, sortFilter, maxExpense, stateFilter]);

  const resetFilters = () => {
    setSortFilter("none");
    setMaxExpense("");
    setStateFilter("");
  };

  return (
    <div className="trip-page container">
      <h1 className="mb-5 display-1 text-center mytrips">My Trips</h1>

      <div className="row mb-2">
        <div className="col">
          <h3 className="text-left mt-3 mb-3">
            Track where you've been across the U.S.
          </h3>
        </div>
        <div className="col">
          <h3 className="text-center mt-3 mb-3">
            View your overall travel stats.
          </h3>
        </div>
        <div className="col">
          <h3 className="text-end mt-3 mb-3">
            See what&apos;s left to explore
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <USMap visitedStates={visitedStates} />
      </div>

      <TripStats trips={trips} visitedStates={visitedStates} />

      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mb-2 justify-content-center d-flex">
          <Button
            className="btn btn-add-trip w-50"
            variant="primary"
            type="button"
            onClick={() => {
              setSelectedTrip(null);
              setShowTripForm(true);
            }}
          >
            + Add New Trip
          </Button>
        </div>

        <div className="col-md-6 mb-2 text-md-left">
          <TripFilters
            sortFilter={sortFilter}
            maxExpense={maxExpense}
            onSortChange={setSortFilter}
            onMaxExpenseChange={setMaxExpense}
            stateFilter={stateFilter}
            states={visitedStates}
            onStateFilterChange={setStateFilter}
            onReset={resetFilters}
          />
        </div>
      </div>

      <div className="mt-4">
        <TripAccordion
          trips={filteredTrips}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
        />
      </div>

      <TripFormModal
        show={showTripForm}
        onHide={() => setShowTripForm(false)}
        onSave={handleSaveTrip}
        initialData={selectedTrip}
      />
    </div>
  );
}
