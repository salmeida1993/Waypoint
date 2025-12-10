import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/account");
    } catch (ex) {
      setError(ex?.message || "Registration failed");
      // Optional: also alert
      alert(ex?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: "2rem auto" }}>
      <h2>Create account</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={onSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            minLength={6}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />
        </label>

        <button disabled={busy} type="submit">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
