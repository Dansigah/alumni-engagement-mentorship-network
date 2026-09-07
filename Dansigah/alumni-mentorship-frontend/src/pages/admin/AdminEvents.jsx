import "./AdminEvents.css";
import TimeInput, { toApiTime, fromApiTime } from "../../components/common/TimeInput";
import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
const eventDateValue = (date, time) => {
  if (!date && !time.hour && !time.minute) return null;
  if (!date) throw new Error("Select an event date.");
  return `${date}T${toApiTime(time.hour, time.minute, time.period).slice(0, 5)}`;
};

export default function AdminEvents() {
  const [time, setTime] = useState(() => fromApiTime(""));
  const changeTime = (field, value) => setTime((current) => ({ ...current, [field]: value }));
  const { user } = useAuth(),
    [rows, setRows] = useState([]),
    [form, setForm] = useState({
      title: "",
      description: "",
      eventDate: "",
      location: "",
    }),
    [editing, setEditing] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api
      .get("/events")
      .then((r) => setRows(r.data))
      .catch(() => setError("Unable to load events."));
  useEffect(() => {
    load();
  }, []);
  const save = (e) => {
    e.preventDefault();
    let eventDate;
    try {
      eventDate = eventDateValue(form.eventDate, time);
    } catch (error) {
      setError(error.message);
      return;
    }
    const body = {
      ...form,
      createdBy: user.id,
      eventDate,
    };
    (editing ? api.put(`/events/${editing}`, body) : api.post("/events", body))
      .then(() => {
        setForm({ title: "", description: "", eventDate: "", location: "" });
        setTime(fromApiTime(""));
        setEditing(null);
        load();
      })
      .catch(() => setError("Unable to save event."));
  };
  const edit = (x) => {
    setEditing(x.id);
    setTime(fromApiTime(x.eventDate?.slice(11)));
    setForm({
      title: x.title || "",
      description: x.description || "",
      eventDate: x.eventDate?.slice(0, 10) || "",
      location: x.location || "",
    });
  };
  const del = (id) =>
    api
      .delete(`/events/${id}`)
      .then(load)
      .catch(() => setError("Unable to delete event."));
  return (
    <>
      <div className="page-title">
        <div>
          <h2>Event Management</h2>
          <p>Create and manage real community events.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h4>{editing ? "Edit Event" : "Create Event"}</h4>
        <form className="row g-3" onSubmit={save}>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Event title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="col-md-6 event-date-field">
            <label className="form-label d-block" htmlFor="event-date">Date</label>
            <input
              id="event-date"
              className="form-control"
              type="date"
              aria-label="Event date"
              required={Boolean(time.hour || time.minute)}
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </div>
          <div className="col-md-6 event-time-field">
            <TimeInput value={time} onChange={changeTime} required={Boolean(form.eventDate || time.hour || time.minute)} />
          </div>
          <div className="col-12">
            <textarea
              className="form-control"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <button className="btn btn-primary">
              {editing ? "Update Event" : "Create Event"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="card border-0 shadow-sm table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((x) => (
                <tr key={x.id}>
                  <td>{x.title}</td>
                  <td>
                    {x.eventDate ? new Date(x.eventDate).toLocaleString(undefined, { hour12: true }) : "—"}
                  </td>
                  <td>{x.location || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => edit(x)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => del(x.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
