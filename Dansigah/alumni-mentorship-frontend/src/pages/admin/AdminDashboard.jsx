import { useEffect, useState } from "react";
import api from "../../api/client";
import StatCard from "../../components/cards/StatCard";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
export default function AdminDashboard() {
  const [stats, setStats] = useState({}),
    [users, setUsers] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users")])
      .then((r) => {
        setStats(r[0].data);
        setUsers(r[1].data);
      })
      .catch(() => setError("Unable to load admin dashboard."))
      .finally(() => setLoading(false));
  }, []);
  const cards = [
    ["bi-people", "Total Users", stats.totalUsers],
    ["bi-mortarboard", "Students", stats.totalStudents],
    ["bi-person-badge", "Alumni", stats.totalAlumni],
    ["bi-chat-dots", "Mentorship Requests", stats.mentorshipRequestCount],
    ["bi-briefcase", "Referrals", stats.referralRequestCount],
    ["bi-calendar-event", "Events", stats.eventCount],
  ];
  if (loading) return <LoadingState message="Loading administration overview..." />;
  return (
    <>
      <div className="page-title">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Overview of the Alumni Engagement Network.</p>
        </div>
      </div>
      {error && <ErrorState message={error} />}
      <div className="row g-3 mb-4">
        {cards.map((x, i) => (
          <StatCard
            key={x[1]}
            icon={x[0]}
            label={x[1]}
            value={x[2]}
            color={
              ["primary", "success", "info", "warning", "danger", "secondary"][
                i
              ]
            }
          />
        ))}
      </div>
      <div className="card border-0 shadow-sm table-responsive">
        <div className="card-header-clean">
          <div>
            <h4>Recent Users</h4>
            <p>Real registered accounts</p>
          </div>
        </div>
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users
                .slice(-6)
                .reverse()
                .map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge text-bg-primary-subtle text-primary">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-cell">
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
