import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, FloatingLabel } from "react-bootstrap";
import states from "../../data/states.json";

export default function TripFormModal({ show, onHide, onSave, initialData }) {
  const blankForm = {
    title: "",
    startDate: "",
    endDate: "",
    destinations: [],
    expenses: {
      transportation: "",
      food: "",
      lodging: "",
      extra: "",
    },
    notes: "",
  };

  const blankDestination = { city: "", state: "", days: "" };

  const [formData, setFormData] = useState(blankForm);
  const [newDestination, setNewDestination] = useState(blankDestination);

  useEffect(() => {
    if (!show) return;
    if (initialData) {
      console.log("Editing trip:", initialData);
      setFormData({
        _id: initialData._id,
        title: initialData.title ?? "",
        startDate: initialData.startDate ?? "",
        endDate: initialData.endDate ?? "",
        destinations: initialData.destinations ?? [],
        expenses: {
          transportation: initialData.expenses.transportation ?? 0,
          food: initialData.expenses.food ?? 0,
          lodging: initialData.expenses.lodging ?? 0,
          extra: initialData.expenses.extra ?? 0,
        },
        notes: initialData.notes ?? "",
      });
    } else {
      setFormData(blankForm);
    }
  }, [initialData, show]);

  useEffect(() => {
    if (!show) {
      setNewDestination(blankDestination);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : value }));
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      expenses: { ...prev.expenses, [name]: value === "" ? 0 : Number(value) },
    }));
  };

  const handleAddDestination = () => {
    //if (!newDestination.city || !newDestination.state) return alert("Please fill in both city and state for the new destination.");
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, { ...newDestination, days: parseInt(newDestination.days) || 0 }],
    }));
    setNewDestination(blankDestination);
  };

  const handleDestinationChange = (index, field, value) => {
    const updatedDestinations = [...formData.destinations];
    updatedDestinations[index][field] = value;
    setFormData((prev) => ({ ...prev, destinations: updatedDestinations }));
  };

  const removeDestination = (index) => {
    if (!window.confirm("Remove this destination?")) return;
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.destinations.length === 0) {
      return alert("Please add at least one destination to the trip.");
    }
    if (formData._id) {
      onSave(formData, true); // Pass true to indicate edit
    } else {
      onSave(formData);
    }
    onHide();
  };

  const tripDuration =
    formData.startDate && formData.endDate
      ? Math.ceil(
          (new Date(formData.endDate) - new Date(formData.startDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 0;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable >
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Trip" : "Add a New Trip"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3 trip-modal">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  className="trip-modal"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3 trip-modal">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Destinations */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Destinations</Form.Label>
              <Button size="sm" onClick={handleAddDestination} className="btn-add-trip">
                + Add Destination
              </Button>
            </div>

            {formData.destinations.map((destination, index) => (
              <div key={index} className="border rounded p-2 mb-2 bg-light">
                <Row>
                  <Col md={4}>
                    <FloatingLabel label="City" className="mb-1">
                      <Form.Control
                        type="text"
                        name="city"
                        placeholder="Chicago"
                        value={destination.city}
                        onChange={(e) =>
                          handleDestinationChange(index, "city", e.target.value)
                        }
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={3}>
                    <FloatingLabel label="State" className="mb-1">
                      <Form.Control
                        type="text"
                        name="state"
                        placeholder="IL"
                        value={destination.state}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (/^[A-Z]{0,2}$/.test(val)) {
                            handleDestinationChange(index, "state", val);
                          }
                        }}
                        list={`state-options-${index}`}
                      />
                    </FloatingLabel>
                    <datalist id={`state-options-${index}`}>
                      {states.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </datalist>
                  </Col>
                  <Col md={3}>
                    <FloatingLabel label="Days" className="mb-1">
                      <Form.Control
                        type="number"
                        name="days"
                        placeholder="3"
                        min={0}
                        max={tripDuration ?? undefined}
                        value={destination.days}
                        onChange={(e) => {
                          const days = e.target.value;
                          if (tripDuration && days > tripDuration) return;
                          handleDestinationChange(index, "days", days);
                        }}
                        disabled={!tripDuration} // Disable if tripDuration is not valid
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={2}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="btn-delete"
                      onClick={() => removeDestination(index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* Expenses */}
          <Row>
            {["transportation", "food", "lodging", "extra"].map((key) => (
              <Col md={3} key={key} className="mb-2">
                <Form.Label className="text-capitalize">{key} Expense</Form.Label>
                <Form.Control
                  type="number"
                  name={key}
                  value={formData.expenses[key]}
                  onChange={handleExpenseChange}
                  placeholder="$0.00"
                />
              </Col>
            ))}
          </Row>

          {/* Notes */}
          <Form.Group className="mt-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" className="btn-delete m-1" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="btn-add-trip">
            Save Trip
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
