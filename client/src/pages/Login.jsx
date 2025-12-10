import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const nav = useNavigate();
  const { login, setErr, err } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(form.email.trim(), form.password);
      nav("/account");
    } catch (ex) {
      alert(ex?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h2>Log in</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={onSubmit}>
        <label className="d-block mb-2">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label className="d-block mb-2">
          Password
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              aria-describedby="passwordHelpBlock"
              value={form.password}
              minLength={6}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ paddingRight: "2rem" }}
            />
            
            <button
            type="button"
            className="icon-button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

          </div>
        </label>
        <div className="mt-3">
          <button disabled={busy} type="submit">
            {busy ? "Signing in…" : "Log in"}
          </button>
        </div>
      </form>
      <p className="help">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
