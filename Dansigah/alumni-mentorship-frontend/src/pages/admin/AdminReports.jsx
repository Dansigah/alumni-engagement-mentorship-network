import { useEffect, useState } from "react";
import api from "../../api/client";
import StatCard from "../../components/cards/StatCard";
export default function AdminReports() {
  const [stats, setStats] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/reports")
      .then((r) => setStats(r.data))
      .catch(() => setError("Unable to load reports."))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" />
        <p>Loading...</p>
      </div>
    );
  const rows = stats
    ? [
        ["Total Users", stats.totalUsers],
        ["Students", stats.totalStudents],
        ["Alumni", stats.totalAlumni],
        ["Mentorship Requests", stats.mentorshipRequestCount],
        ["Referral Requests", stats.referralRequestCount],
        ["Events", stats.eventCount],
      ]
    : [];
  return (
    <>
      <div className="page-title">
        <div>
          <h2>Reports</h2>
          <p>Current real system statistics.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3 mb-4">
        {rows.map((x, i) => (
          <StatCard
            key={x[0]}
            icon={
              [
                "bi-people",
                "bi-mortarboard",
                "bi-person-badge",
                "bi-chat-dots",
                "bi-briefcase",
                "bi-calendar-event",
              ][i]
            }
            label={x[0]}
            value={x[1]}
          />
        ))}
      </div>
      <div className="card border-0 shadow-sm table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((x) => (
                <tr key={x[0]}>
                  <td>{x[0]}</td>
                  <td className="fw-bold">{x[1] ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="empty-cell">
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
