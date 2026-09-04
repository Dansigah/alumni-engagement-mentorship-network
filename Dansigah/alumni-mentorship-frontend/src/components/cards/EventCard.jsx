export default function EventCard({ event }) {
  const d = event.eventDate ? new Date(event.eventDate) : null;
  return (
    <div className="d-flex gap-3 py-3 border-bottom">
      <div className="date-box">
        <strong>{d ? d.getDate() : "—"}</strong>
        <small>
          {d ? d.toLocaleString(undefined, { month: "short" }) : ""}
        </small>
      </div>
      <div>
        <h6 className="fw-semibold mb-1">{event.title}</h6>
        {d && (
          <p className="small text-muted mb-1">
            <i className="bi bi-clock me-1" />
            {d.toLocaleString()}
          </p>
        )}
        <p className="small text-muted mb-0">
          <i className="bi bi-geo-alt me-1" />
          {event.location || "Venue not specified"}
        </p>
      </div>
    </div>
  );
}
