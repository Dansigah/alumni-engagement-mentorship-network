import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
export default function AdminEvents() {
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
    const body = {
      ...form,
      createdBy: user.id,
      eventDate: form.eventDate || null,
    };
    (editing ? api.put(`/events/${editing}`, body) : api.post("/events", body))
      .then(() => {
        setForm({ title: "", description: "", eventDate: "", location: "" });
        setEditing(null);
        load();
      })
      .catch(() => setError("Unable to save event."));
  };
  const edit = (x) => {
    setEditing(x.id);
    setForm({
      title: x.title || "",
      description: x.description || "",
      eventDate: x.eventDate?.slice(0, 16) || "",
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
          <div className="col-md-6">
            <input
              className="form-control"
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
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
                    {x.eventDate ? new Date(x.eventDate).toLocaleString() : "—"}
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
