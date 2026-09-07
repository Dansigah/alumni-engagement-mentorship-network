import { useId, useState } from "react";

export default function MentorshipRequestForm({ onSubmit, onCancel }) {
  const id = useId();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    const text = message.trim();
    if (!text || message.length > 2000) {
      setError("Enter a message of 1 to 2000 characters.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await onSubmit(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="card p-3 mb-4" onSubmit={submit}>
      <label className="form-label" htmlFor={id}>Message to Mentor</label>
      <textarea id={id} className="form-control" rows="4" required maxLength={2000}
        value={message} onChange={(event) => setMessage(event.target.value)}
        disabled={sending} />
      <small className="text-muted mt-1">{message.length}/2000 characters</small>
      {error && <p className="text-danger mt-2 mb-0" role="alert">{error}</p>}
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" disabled={sending}>{sending ? "Sending..." : "Send Request"}</button>
        <button type="button" className="btn btn-outline-secondary" disabled={sending} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
