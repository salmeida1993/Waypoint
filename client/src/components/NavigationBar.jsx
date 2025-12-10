import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

function NavigationBar({ user, logout }) {
  return (
    <Navbar expand="md" className="navbar-theme">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          Waypoint
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto nav-links">
            <Nav.Link as={Link} to="/states">States</Nav.Link>
            {user && <Nav.Link as={Link} to="/mytrips">My Trips</Nav.Link>}
          </Nav>
          <Nav className="ms-auto nav-links">
            {!user && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
            {!user && <Nav.Link as={Link} to="/register">Register</Nav.Link>}
            {user && <Nav.Link as={Link} to="/account">Account</Nav.Link>}
            {user && (
              <button onClick={logout} className="linklike">
                Logout
              </button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
