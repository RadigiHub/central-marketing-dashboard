// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setError(error.message || "Login failed");
      return;
    }

    // success -> dashboard
    router.replace("/");
  }

  return (
    <div className="page">
      <div className="layout-main" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="card">
          <h1 style={{ marginBottom: "0.5rem" }}>Central Marketing Login</h1>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
            Apna Supabase user email & password use karo.
          </p>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shehroze@timestravel.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: 14,
                  marginTop: "0.5rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ marginTop: "1.5rem" }}
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
