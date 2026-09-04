import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function MentorshipRequests() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/mentorships/${user.role.toLowerCase()}/${user.id}`,
      );
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch {
      setRows([]);
      setError("Unable to load mentorship requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user.id, user.role]);

  useEffect(() => {
    if (user.role !== "STUDENT") {
      setMentors([]);
      return;
    }

    let active = true;
    api
      .get("/users/mentors")
      .then((response) => {
        if (active) {
          setMentors(
            Array.isArray(response.data)
              ? response.data.filter((mentor) => mentor?.id != null)
              : [],
          );
        }
      })
      .catch(() => {
        if (active) {
          setMentors([]);
        }
      });

    return () => {
      active = false;
    };
  }, [user.role]);

  const updateStatus = async (id, status) => {
    if (updatingId != null) return;
    setUpdatingId(id);
    setError("");
    try {
      await api.put(`/mentorships/${id}/status?status=${status}`);
      await loadRequests();
    } catch {
      setError("Unable to update mentorship request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const mentorFor = (alumniId) =>
    mentors.find((mentor) => mentor?.id === alumniId);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Mentorship Requests</h2>
          <p>
            {user.role === "ALUMNI"
              ? "Review incoming student requests."
              : "Track your mentorship connections."}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              {user.role === "STUDENT" && <th>Alumni</th>}
              <th>Message</th>
              <th>Status</th>
              {user.role === "ALUMNI" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((request) => {
                const mentor = mentorFor(request.alumniId);
                const status = String(
                  request.status || "PENDING",
                ).toUpperCase();

                return (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    {user.role === "STUDENT" && (
                      <td>
                        {mentor ? (
                          <>
                            <div className="fw-semibold">
                              {mentor.name || "Alumni"}
                            </div>
                            <small className="text-muted">
                              {mentor.email || ""}
                            </small>
                          </>
                        ) : (
                          `Alumni #${request.alumniId || "-"}`
                        )}
                      </td>
                    )}
                    <td>{request.message || "No message"}</td>
                    <td>
                      <span className={`badge status-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    {user.role === "ALUMNI" && (
                      <td>
                        {status === "PENDING" ? (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              disabled={updatingId === request.id}
                              onClick={() => updateStatus(request.id, "ACCEPTED")}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={updatingId === request.id}
                              onClick={() => updateStatus(request.id, "REJECTED")}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-muted small">Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No mentorship requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
