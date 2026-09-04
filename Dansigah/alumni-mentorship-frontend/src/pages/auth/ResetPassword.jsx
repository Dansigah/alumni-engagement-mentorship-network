import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!token) return setError("A password reset token is required.");
    if (form.password.length < 6) return setError("Password must contain at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/reset-password", { token, newPassword: form.password });
      navigate("/login", { replace: true, state: { message: data.message } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo"><i className="bi bi-mortarboard-fill me-2" />Past Pupils</Link>
        <h1>Choose a new password.</h1><p>Your reset token is short-lived and can only be used once.</p>
      </div>
      <div className="auth-form-panel"><div className="auth-card">
        <Link to="/login" className="small text-decoration-none"><i className="bi bi-arrow-left me-1" />Back to Login</Link>
        <h2 className="fw-bold mt-4">Reset Password</h2>
        <p className="text-muted">Enter a new password containing at least 6 characters.</p>
        {location.state?.message && <div className="alert alert-info">{location.state.message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <label className="form-label">New Password</label>
          <div className="input-group mb-3"><input className="form-control" type={showPassword ? "text" : "password"} required minLength="6" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="btn btn-outline-secondary" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} /></button></div>
          <label className="form-label">Confirm New Password</label>
          <div className="input-group mb-4"><input className="form-control" type={showConfirmPassword ? "text" : "password"} required minLength="6" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /><button type="button" className="btn btn-outline-secondary" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((visible) => !visible)}><i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} /></button></div>
          <button className="btn btn-primary w-100 py-2" disabled={loading || !token}>{loading ? "Resetting..." : "Reset Password"}</button>
        </form>
      </div></div>
    </main>
  );
}
