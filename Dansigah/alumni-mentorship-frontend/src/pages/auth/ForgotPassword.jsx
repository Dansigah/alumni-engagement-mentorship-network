import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      if (data.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(data.resetToken)}`, { state: { message: data.message } });
      } else setMessage(data.message);
    } catch {
      setError("Unable to prepare password reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo"><i className="bi bi-mortarboard-fill me-2" />Past Pupils</Link>
        <h1>Recover access securely.</h1><p>Request a short-lived link to set a new password.</p>
      </div>
      <div className="auth-form-panel"><div className="auth-card">
        <Link to="/login" className="small text-decoration-none"><i className="bi bi-arrow-left me-1" />Back to Login</Link>
        <h2 className="fw-bold mt-4">Forgot Password</h2>
        <p className="text-muted">Enter the email address registered with your account.</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <label className="form-label">Email</label>
          <input className="form-control mb-4" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button className="btn btn-primary w-100 py-2" disabled={loading}>{loading ? "Preparing..." : "Send Reset Request"}</button>
        </form>
      </div></div>
    </main>
  );
}
