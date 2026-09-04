import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/cards/StatCard";
import NotificationCard from "../../components/cards/NotificationCard";
export default function AlumniDashboard() {
  const { user } = useAuth(),
    [data, setData] = useState({
      mentorships: [],
      sessions: [],
      referrals: [],
      notifications: [],
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get(`/mentorships/alumni/${user.id}`),
      api.get(`/sessions/user/${user.id}`),
      api.get(`/referrals/alumni/${user.id}`),
      api.get(`/notifications/user/${user.id}`),
    ])
      .then((r) =>
        setData({
          mentorships: r[0].data,
          sessions: r[1].data,
          referrals: r[2].data,
          notifications: r[3].data,
        }),
      )
      .catch(() => setError("Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, [user]);
  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" />
      </div>
    );
  return (
    <>
      <div className="page-title">
        <div>
          <p className="text-primary fw-semibold mb-1">Welcome back</p>
          <h2>Hello, {user.name}</h2>
          <p>Support students and manage your alumni engagement.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3 mb-4">
        <StatCard
          icon="bi-inbox"
          label="Incoming Requests"
          value={data.mentorships.filter((x) => String(x.status).toUpperCase() === "PENDING").length}
        />
        <StatCard
          icon="bi-person-check"
          label="Accepted Mentorships"
          value={data.mentorships.filter((x) => String(x.status).toUpperCase() === "ACCEPTED").length}
          color="success"
        />
        <StatCard
          icon="bi-calendar-check"
          label="Sessions"
          value={data.sessions.length}
          color="warning"
        />
        <StatCard
          icon="bi-briefcase"
          label="Referral Requests"
          value={data.referrals.length}
          color="danger"
        />
      </div>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h4>Recent Mentorship Requests</h4>
            {data.mentorships.length ? (
              data.mentorships.slice(0, 5).map((x) => (
                <div
                  className="d-flex justify-content-between border-bottom py-3"
                  key={x.id}
                >
                  <span>{x.message || `Request #${x.id}`}</span>
                  <span className={`badge status-${x.status.toLowerCase()}`}>
                    {x.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted mt-3">No requests found.</p>
            )}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm px-4">
            <h4 className="pt-4">Notifications</h4>
            {data.notifications.length ? (
              data.notifications
                .slice(0, 4)
                .map((n) => <NotificationCard notification={n} key={n.id} />)
            ) : (
              <p className="text-muted py-3">No notifications available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
