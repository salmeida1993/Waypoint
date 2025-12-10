import PropTypes from "prop-types";
import { Accordion, Card, Row, Col, Button } from "react-bootstrap";

function sumExpensesSafe(expenses) {
  // Ensure we get an object
  if (!expenses || typeof expenses !== "object") return 0;

  try {
    const vals = Object.values(expenses);
    // Coerce each value to a number (fallback to 0) and sum
    const total = vals.reduce((acc, v) => {
      const n = Number(v);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    // Ensure it's a finite number
    return Number.isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}

export default function TripAccordion({ trips, onEdit, onDelete }) {
  if (!trips || trips.length === 0) {
    return (
      <p className="text-center mt-4">
        No trips added yet. Go and add your first trip to log!
      </p>
    );
  }

  TripAccordion.propTypes = {
    trips: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        title: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        destinations: PropTypes.arrayOf(
          PropTypes.shape({
            city: PropTypes.string,
            state: PropTypes.string,
            days: PropTypes.number,
          })
        ),
        expenses: PropTypes.object,
        notes: PropTypes.string,
      })
    ).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  return (
    <Accordion alwaysOpen>
      {trips.map((trip, index) => {
        // --- SAFETY: Normalize destinations & expenses ---
        const destinationsArray = Array.isArray(trip.destinations)
          ? trip.destinations
          : [];
        const expensesObj =
          trip.expenses && typeof trip.expenses === "object"
            ? trip.expenses
            : {};

        const totalExpense = sumExpensesSafe(expensesObj);

        return (
          <Accordion.Item eventKey={trip._id} key={trip._id || index}>
            <Accordion.Header>
              <Row className="w-100">
                <Col className="align-items-center">
                  <h4>
                    <strong>{trip.title || "Untitled Trip"}</strong>
                  </h4>
                </Col>

                <Col className="align-items-center text-center">
                  {trip.startDate || "—"} - {trip.endDate || "—"}
                </Col>

                <Col className="text-center">
                  {destinationsArray.length > 0
                    ? `${destinationsArray.length} Destination${destinationsArray.length > 1 ? "s" : ""}`
                    : "No Destinations"}
                </Col>

                <Col className="text-center">${totalExpense.toFixed(2)}</Col>
              </Row>
            </Accordion.Header>

            <Accordion.Body className="accordion-body">
              {/* Destinations */}
              {destinationsArray.length > 0 && (
                <>
                  <h5 className="mb-3">Destinations</h5>
                  <Row xs={1} md={4} lg={5} className="g-4">
                    {destinationsArray.map((destination, destinationIndex) => (
                      <Col key={destination._id || destinationIndex}>
                        <Card className="accordion-inner-cards">
                          <Card.Body className="text-left">
                            <Card.Title>
                              <strong>
                                {destination.city || "Unknown City"},{" "}
                                {destination.state || "??"}
                              </strong>
                            </Card.Title>
                            <Card.Text>Days: {destination.days ?? 0}</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {/* Expenses */}
              {Object.keys(expensesObj).length > 0 && (
                <>
                  <h5 className=" mb-3">Expenses</h5>
                  <Row xs={1} md={2} lg={5} className="g-3">
                    {Object.entries(expensesObj).map(([key, value]) => (
                      <Col key={key}>
                        <Card className="accordion-inner-cards">
                          <Card.Body>
                            <Card.Title className="text-capitalize">
                              <strong>{key}</strong>
                            </Card.Title>
                            <Card.Text>
                              $
                              {Number.isFinite(Number(value))
                                ? Number(value).toFixed(2)
                                : "0.00"}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}

                    <Col>
                      <Card className="accordion-inner-cards">
                        <Card.Body className="accordion-total-expense-card">
                          <Card.Title>
                            <strong>Total Expense</strong>
                          </Card.Title>
                          <Card.Text>
                            <strong>${totalExpense.toFixed(2)}</strong>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}

              {/* Notes */}
              {trip.notes && (
                <>
                  <h5 className="mt-4">Notes</h5>
                  <p>{trip.notes}</p>
                </>
              )}

              {/* Edit/Delete Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(trip)}
                >
                  Edit
                </Button>
                <Button
                  className="btn-delete"
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(trip)}
                >
                  Delete
                </Button>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
