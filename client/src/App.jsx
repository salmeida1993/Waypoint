import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import AccountEdit from "./pages/AccountEdit.jsx";
import AccountDelete from "./pages/AccountDelete.jsx";
import StateIndex from "./pages/StateIndex.jsx";
import StateDetail from "./pages/StateDetail.jsx";
import Trip from "./pages/Trip.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NavigationBar from "./components/NavigationBar.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <>
      <NavigationBar user={user} logout={logout} />

      <main className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected account routes */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/edit"
            element={
              <ProtectedRoute>
                <AccountEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/delete"
            element={
              <ProtectedRoute>
                <AccountDelete />
              </ProtectedRoute>
            }
          />

          {/* States */}
          <Route path="/states" element={<StateIndex />} />
          <Route path="/states/:code" element={<StateDetail />} />

          {/* Trips (protected) */}
          <Route
            path="/mytrips"
            element={
              <ProtectedRoute>
                <Trip />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

// AuthProvider wraps the whole app
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
