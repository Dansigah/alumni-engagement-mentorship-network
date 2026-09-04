import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function Register() {
  const { register } = useAuth(),
    navigate = useNavigate(),
    [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must contain at least 6 characters.");
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login", {
        state: {
          message:
            form.role === "ALUMNI"
              ? "Registration successful. Account pending Admin approval."
              : "Registration successful. You can now sign in.",
        },
      });
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed.");
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
        <h1>Join a network built around shared experience.</h1>
        <p>Connect with mentors, students and alumni from your community.</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="small text-decoration-none">
            <i className="bi bi-arrow-left me-1" />
            Back to Home
          </Link>
          <h2 className="fw-bold mt-4">Create Account</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <label className="form-label">Full Name</label>
            <input
              className="form-control mb-3"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="form-label">Email</label>
            <input
              className="form-control mb-3"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label className="form-label">Register As</label>
            <select
              className="form-select mb-3"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
            </select>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <div className="input-group mb-3">
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
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm Password</label>
                <div className="input-group mb-3">
                  <input
                    className="form-control"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  <button type="button" className="btn btn-outline-secondary" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((visible) => !visible)}>
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>
            </div>
            <button className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center mt-4 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
