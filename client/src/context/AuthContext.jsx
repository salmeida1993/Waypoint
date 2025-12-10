/* eslint react-refresh/only-export-components: "off" */

// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Generic API helper using credentials + JSON
async function api(path, options = {}) {
  const res = await fetch(path, {
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
    // ignore JSON parse failures
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return data || {};
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load current session user on first mount
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { user: u } = await api("/api/auth/me");
        if (!cancel) setUser(u || null);
      } catch {
        if (!cancel) setUser(null);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const register = useCallback(async (name, email, password) => {
    setErr("");
    const { user: u } = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setUser(u || null);
    return u;
  }, []);

  const login = useCallback(async (email, password) => {
    setErr("");
    const { user: u } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u || null);
    return u;
  }, []);

  const logout = useCallback(async () => {
    setErr("");
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const updateMe = useCallback(async (updates) => {
    setErr("");
    const { user: u } = await api("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setUser(u || null);
    return u;
  }, []);

  const deleteMe = useCallback(async () => {
    setErr("");
    await api("/api/auth/me", { method: "DELETE" });
    setUser(null);
  }, []);

  const loadVisited = useCallback(async () => {
    const { visitedStates = [] } = await api("/api/auth/visited");
    return visitedStates;
  }, []);

  const saveVisited = useCallback(async (codes) => {
    const { visitedStates = [] } = await api("/api/auth/visited", {
      method: "POST",
      body: JSON.stringify({ visitedStates: codes }),
    });
    return visitedStates;
  }, []);

  const value = {
    user,
    loading,
    err,
    setErr,
    register,
    login,
    logout,
    updateMe,
    deleteMe,
    loadVisited,
    saveVisited,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
