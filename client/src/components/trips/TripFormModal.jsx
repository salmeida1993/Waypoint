import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import states from "../../data/states.json";

export default function TripFormModal({ show, onHide, onSave, initialData }) {
  const blankForm = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    legs: [],
    expenses: {
      transportation: "",
      food: "",
      lodging: "",
      extra: "",
    },
    notes: "",
  };

  const blankLeg = { city: "", state: "", days: "" };

  const [formData, setFormData] = useState(blankForm);
  const [newLeg, setNewLeg] = useState(blankLeg);

  useEffect(() => {
    if (!show) return;
    if (initialData) {
      console.log("Editing trip:", initialData);
      setFormData({
        _id: initialData._id,
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        startDate: initialData.startDate ?? "",
        endDate: initialData.endDate ?? "",
        legs: initialData.legs ?? [],
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
      setNewLeg(blankLeg);
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

  const handleAddLeg = () => {
    //if (!newLeg.city || !newLeg.state) return alert("Please fill in both city and state for the new leg.");
    setFormData((prev) => ({
      ...prev,
      legs: [...prev.legs, { ...newLeg, days: parseInt(newLeg.days) || 0 }],
    }));
    setNewLeg(blankLeg);
  };

  const handleLegChange = (index, field, value) => {
    const updatedLegs = [...formData.legs];
    updatedLegs[index][field] = value;
    setFormData((prev) => ({ ...prev, legs: updatedLegs }));
  };

  const removeLeg = (index) => {
    if (!window.confirm("Remove this leg?")) return;
    setFormData((prev) => ({
      ...prev,
      legs: prev.legs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.legs.length === 0) {
      return alert("Please add at least one leg to the trip.");
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
    <Modal show={show} onHide={onHide} centered size="lg">
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
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3 trip-modal">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
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

          {/* Legs */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Legs</Form.Label>
              <Button size="sm" onClick={handleAddLeg} className="btn-add-trip">
                + Add Leg
              </Button>
            </div>

            {formData.legs.map((leg, index) => (
              <div key={index} className="border rounded p-2 mb-2 bg-light">
                <Row>
                  <Col md={4}>
                    <Form.Control
                      placeholder="City"
                      value={leg.city}
                      onChange={(e) =>
                        handleLegChange(index, "city", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      placeholder="State (e.g., TX)"
                      value={leg.state}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (/^[A-Z]{0,2}$/.test(val)) {
                          handleLegChange(index, "state", val);
                      }
                      }}
                      list={`state-options-${index}`}
                    />
                    <datalist id={`state-options-${index}`}>
                      {states.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </datalist>
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Days"
                      value={leg.days}
                      min={0}
                      max={tripDuration ?? undefined}
                      onChange={(e) => {
                        const days = e.target.value;
                        if (tripDuration && days > tripDuration) return;
                        handleLegChange(index, "days", days);
                      }}
                      disabled={!tripDuration} // Disable if tripDuration is not valid
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="btn-delete"
                      onClick={() => removeLeg(index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* Expenses */}
          <h6 className="mt-4">Expenses</h6>
          <Row>
            {["transportation", "food", "lodging", "extra"].map((key) => (
              <Col md={3} key={key} className="mb-2">
                <Form.Label className="text-capitalize">{key}</Form.Label>
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
          <Button variant="secondary" className="btn-delete" onClick={onHide}>
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
