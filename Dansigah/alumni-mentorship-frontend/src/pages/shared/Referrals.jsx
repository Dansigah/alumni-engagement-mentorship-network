import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
export default function Referrals() {
  const { user } = useAuth(),
    [rows, setRows] = useState([]),
    [mentors, setMentors] = useState([]),
    [alumniSearch, setAlumniSearch] = useState(""),
    [form, setForm] = useState({
      alumniId: "",
      company: "",
      position: "",
      message: "",
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [updatingId, setUpdatingId] = useState(null);
  const load = () => {
    setLoading(true);
    return api
      .get(`/referrals/${user.role.toLowerCase()}/${user.id}`)
      .then((r) => setRows(r.data))
      .catch(() => setError("Unable to load data."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    if (user.role === "STUDENT")
      api.get("/users/mentors").then((r) => setMentors(r.data));
  }, [user]);
  const filteredMentors = useMemo(() => {
    const term = alumniSearch.trim().toLowerCase();
    if (!term) return mentors;
    return mentors.filter((mentor) =>
      [mentor.name, mentor.email].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [mentors, alumniSearch]);
  const create = (e) => {
    e.preventDefault();
    if (!form.alumniId) return setError("Please select an alumnus.");
    api
      .post("/referrals", {
        ...form,
        studentId: user.id,
        alumniId: Number(form.alumniId),
      })
      .then(() => {
        setForm({ alumniId: "", company: "", position: "", message: "" });
        load();
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to submit referral."),
      );
  };
  const action = async (id, status) => {
    if (updatingId != null) return;
    setUpdatingId(id);
    setError("");
    try {
      await api.put(`/referrals/${id}/status?status=${status}`);
      await load();
    } catch (requestError) {
      if (requestError.response?.status === 409) await load();
      else setError(requestError.response?.data?.message || "Unable to update referral request.");
    } finally {
      setUpdatingId(null);
    }
  };
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
          <h2>Referral Requests</h2>
          <p>Manage career referral opportunities.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {user.role === "STUDENT" && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <h4>Request a Referral</h4>
          <form onSubmit={create} className="row g-3">
            <div className="col-md-6">
              <input
                className="form-control mb-2"
                type="search"
                placeholder="Search alumni by name"
                value={alumniSearch}
                onChange={(e) => {
                  setAlumniSearch(e.target.value);
                  setForm({ ...form, alumniId: "" });
                }}
              />
              <select
                className="form-select"
                required
                value={form.alumniId}
                onChange={(e) => setForm({ ...form, alumniId: e.target.value })}
              >
                <option value="">Select alumni</option>
                {filteredMentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.email ? ` (${m.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="col-12">
              <textarea
                className="form-control"
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Submit Request</button>
            </div>
          </form>
        </div>
      )}
      <div className="card border-0 shadow-sm table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Message</th>
              <th>Status</th>
              {user.role === "ALUMNI" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((x) => {
                const status = String(x.status || "PENDING").toUpperCase();
                return (
                <tr key={x.id}>
                  <td>{x.company || "—"}</td>
                  <td>{x.position || "—"}</td>
                  <td>{x.message || "—"}</td>
                  <td>
                    <span className={`badge status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  {user.role === "ALUMNI" && (
                    <td>
                      {status === "PENDING" ? <>
                        <button className="btn btn-sm btn-success me-2" disabled={updatingId === x.id} onClick={() => action(x.id, "APPROVED")}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" disabled={updatingId === x.id} onClick={() => action(x.id, "REJECTED")}>Reject</button>
                      </> : <span className="text-muted small">Processed</span>}
                    </td>
                  )}
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-cell">
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
