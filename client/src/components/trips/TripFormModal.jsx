import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  FloatingLabel,
} from "react-bootstrap";
import states from "../../data/states.json";

/**
 * TripFormModal
 * - Handles both creating and editing a trip
 * - Uses useMemo for blankForm / blankDestination so ESLint deps are satisfied
 */
export default function TripFormModal({
  show,
  onHide,
  onSave,
  initialData,
}) {
  // Base shapes for a new trip and destination row
  const blankForm = useMemo(
    () => ({
      title: "",
      startDate: "",
      endDate: "",
      notes: "",
      expenses: {
        lodging: "",
        transport: "",
        food: "",
        misc: "",
      },
    }),
    []
  );

  const blankDestination = useMemo(
    () => [
      {
        city: "",
        state: "",
        days: "",
      },
    ],
    []
  );

  const [form, setForm] = useState(blankForm);
  const [destinations, setDestinations] = useState(blankDestination);

  // When modal opens or initialData changes, initialize form + destinations
  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        title: initialData.title || "",
        startDate: initialData.startDate
          ? initialData.startDate.slice(0, 10)
          : "",
        endDate: initialData.endDate
          ? initialData.endDate.slice(0, 10)
          : "",
        notes: initialData.notes || "",
        expenses: {
          lodging: initialData.expenses?.lodging ?? "",
          transport: initialData.expenses?.transport ?? "",
          food: initialData.expenses?.food ?? "",
          misc: initialData.expenses?.misc ?? "",
        },
        _id: initialData._id, // keep id if editing
      });

      setDestinations(
        initialData.destinations?.length
          ? initialData.destinations.map((d) => ({
              city: d.city || "",
              state: d.state || "",
              days: d.days != null ? String(d.days) : "",
            }))
          : blankDestination
      );
    } else {
      setForm(blankForm);
      setDestinations(blankDestination);
    }
  }, [show, initialData, blankForm, blankDestination]);

  const updateExpenseField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [field]: value,
      },
    }));
  };

  const handleDestinationChange = (index, field, value) => {
    setDestinations((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const addDestinationRow = () => {
    setDestinations((prev) => [
      ...prev,
      { city: "", state: "", days: "" },
    ]);
  };

  const removeDestinationRow = (index) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedDestinations = destinations
      .filter((d) => d.city || d.state)
      .map((d) => ({
        city: d.city.trim(),
        state: d.state,
        days: d.days ? Number(d.days) : 0,
      }));

    const cleanedExpenses = {
      lodging: Number(form.expenses.lodging || 0),
      transport: Number(form.expenses.transport || 0),
      food: Number(form.expenses.food || 0),
      misc: Number(form.expenses.misc || 0),
    };

    const payload = {
      ...form,
      destinations: cleanedDestinations,
      expenses: cleanedExpenses,
    };

    onSave(payload);
  };

  const isEditMode = Boolean(initialData && initialData._id);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit trip" : "Add a new trip"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="tripTitle">
            <Form.Label>Trip title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Summer road trip"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="tripStartDate">
                <Form.Label>Start date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="tripEndDate">
                <Form.Label>End date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Form.Label>Destinations</Form.Label>
          {destinations.map((dest, idx) => (
            <Row className="mb-2" key={idx}>
              <Col md={5}>
                <FloatingLabel
                  controlId={`destCity-${idx}`}
                  label="City"
                >
                  <Form.Control
                    type="text"
                    value={dest.city}
                    onChange={(e) =>
                      handleDestinationChange(
                        idx,
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                  />
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel
                  controlId={`destState-${idx}`}
                  label="State"
                >
                  <Form.Select
                    value={dest.state}
                    onChange={(e) =>
                      handleDestinationChange(
                        idx,
                        "state",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select state</option>
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={3}>
                <FloatingLabel
                  controlId={`destDays-${idx}`}
                  label="Days"
                >
                  <Form.Control
                    type="number"
                    min={0}
                    value={dest.days}
                    onChange={(e) =>
                      handleDestinationChange(
                        idx,
                        "days",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                </FloatingLabel>
              </Col>
              <Col xs={12} className="mt-1">
                {destinations.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    type="button"
                    onClick={() => removeDestinationRow(idx)}
                  >
                    Remove stop
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            className="mt-2"
            onClick={addDestinationRow}
          >
            + Add another stop
          </Button>

          <hr />

          <Form.Label>Approximate expenses</Form.Label>
          <Row className="mb-2">
            <Col md={6}>
              <Form.Group controlId="expLodging">
                <Form.Label>Lodging</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.expenses.lodging}
                  onChange={(e) =>
                    updateExpenseField("lodging", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="expTransport">
                <Form.Label>Transport</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.expenses.transport}
                  onChange={(e) =>
                    updateExpenseField("transport", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="expFood">
                <Form.Label>Food</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.expenses.food}
                  onChange={(e) =>
                    updateExpenseField("food", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="expMisc">
                <Form.Label>Misc</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.expenses.misc}
                  onChange={(e) =>
                    updateExpenseField("misc", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="tripNotes" className="mb-0">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Highlights, favorite spots, or anything you want to remember."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            className="btn-cancel"
            onClick={onHide}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="btn-approve"
          >
            {isEditMode ? "Save changes" : "Add trip"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

TripFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    notes: PropTypes.string,
    destinations: PropTypes.arrayOf(
      PropTypes.shape({
        city: PropTypes.string,
        state: PropTypes.string,
        days: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      })
    ),
    expenses: PropTypes.shape({
      lodging: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      transport: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      food: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      misc: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
    }),
  }),
};

TripFormModal.defaultProps = {
  initialData: null,
};
