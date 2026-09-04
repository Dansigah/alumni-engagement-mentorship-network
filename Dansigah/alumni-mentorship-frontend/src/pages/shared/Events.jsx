import { useEffect, useState } from "react";
import api from "../../api/client";
import EventCard from "../../components/cards/EventCard";
export default function Events() {
  const [events, setEvents] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/events")
      .then((r) => setEvents(r.data))
      .catch(() => setError("Unable to load data."))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" />
        <p>Loading...</p>
      </div>
    );
  return (
    <>
      <div className="page-title">
        <div>
          <h2>Events</h2>
          <p>Discover upcoming alumni and school community events.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card border-0 shadow-sm px-4">
        {events.length ? (
          events.map((e) => <EventCard event={e} key={e.id} />)
        ) : (
          <div className="empty-state">No events found.</div>
        )}
      </div>
    </>
  );
}
