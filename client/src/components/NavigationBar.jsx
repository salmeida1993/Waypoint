// client/src/components/NavigationBar.jsx

/* eslint react-refresh/only-export-components: "off" */
// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Helper to call our backend API, always with /api prefix and cookies
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore if no JSON body
  }

  if (!res.ok) {
    const message =
      data?.message || `Request to ${path} failed with ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, ask the backend who we are
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await api("/auth/me", { method: "GET" });
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch {
        // Not logged in is fine; user stays null
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function NavigationBar({ user, logout }) {
  const navigate = useNavigate();

  return (
    <Navbar expand="md" className="navbar-theme">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          Waypoint
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto nav-links">
            <Nav.Link as={Link} to="/states">
              States
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/mytrips">
                My Trips
              </Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto nav-links">
            {!user && (
              <Nav.Link as={Link} to="/register">
                Register
              </Nav.Link>
            )}
            {!user && (
              <button
                className="linklike"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
            {user && (
              <Nav.Link as={Link} to="/account">
                Account
              </Nav.Link>
            )}
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

NavigationBar.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  logout: PropTypes.func.isRequired,
};

export default NavigationBar;
