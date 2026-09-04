import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function Login() {
  const { login } = useAuth(),
    navigate = useNavigate(),
    location = useLocation(),
    [form, setForm] = useState({ email: "", password: "" }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const u = await login(form.email, form.password);
      navigate(
        u.role === "ADMIN"
          ? "/admin/dashboard"
          : u.role === "ALUMNI"
            ? "/alumni/dashboard"
            : "/student/dashboard",
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo">
          <i className="bi bi-mortarboard-fill me-2" />
          Past Pupils
        </Link>
        <h1>Welcome back to your community.</h1>
        <p>Continue building connections that last beyond the classroom.</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="small text-decoration-none">
            <i className="bi bi-arrow-left me-1" />
            Back to Home
          </Link>
          <h2 className="fw-bold mt-4">Sign in</h2>
          <p className="text-muted">Access your alumni network dashboard.</p>
          {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <label className="form-label">Email</label>
            <input
              className="form-control mb-3"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="small">Forgot Password?</Link>
            </div>
            <div className="input-group mb-4">
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="btn btn-outline-secondary" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            <button className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <p className="text-center mt-4 mb-0">
            New to the network? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
