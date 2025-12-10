// client/src/pages/Account.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Account() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="account-page">
        <h1>Account</h1>
        <p>You need to log in to view your account.</p>
        <Link to="/login" className="btn primary">
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <section className="account-page">
      <h1>Your account</h1>

      <div className="card">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div className="account-actions">
        <Link to="/account/edit" className="btn btn-approve">
          Edit account
        </Link>
        <Link to="/account/delete" className="btn btn-cancel">
          Delete account
        </Link>
      </div>
    </section>
  );
}
