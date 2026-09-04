import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/cards/StatCard";
import MentorCard from "../../components/cards/MentorCard";
import EventCard from "../../components/cards/EventCard";
import NotificationCard from "../../components/cards/NotificationCard";
export default function StudentDashboard() {
  const { user } = useAuth(),
    [data, setData] = useState({
      mentorships: [],
      sessions: [],
      referrals: [],
      notifications: [],
      mentors: [],
      events: [],
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get(`/mentorships/student/${user.id}`),
      api.get(`/sessions/user/${user.id}`),
      api.get(`/referrals/student/${user.id}`),
      api.get(`/notifications/user/${user.id}`),
      api.get("/users/mentors"),
      api.get("/events"),
    ])
      .then((r) =>
        setData({
          mentorships: r[0].data,
          sessions: r[1].data,
          referrals: r[2].data,
          notifications: r[3].data,
          mentors: r[4].data,
          events: r[5].data,
        }),
      )
      .catch(() => setError("Unable to load dashboard information."))
      .finally(() => setLoading(false));
  }, [user]);
  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" />
        <p>Loading dashboard...</p>
      </div>
    );
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">Welcome back</p>
          <h2 className="fw-bold">Hello, {user.name}</h2>
          <p className="text-muted mb-0">
            Manage your mentorship activities and career development from one
            place.
          </p>
        </div>
        <Link className="btn btn-primary" to="/student/mentors">
          <i className="bi bi-search me-2" />
          Find a Mentor
        </Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3 mb-4">
        <StatCard
          icon="bi-chat-dots"
          label="Mentorship Requests"
          value={data.mentorships.length}
        />
        <StatCard
          icon="bi-calendar-check"
          label="Sessions"
          value={data.sessions.length}
          color="success"
        />
        <StatCard
          icon="bi-briefcase"
          label="Referral Requests"
          value={data.referrals.length}
          color="warning"
        />
        <StatCard
          icon="bi-bell"
          label="Notifications"
          value={data.notifications.filter((x) => !x.readStatus).length}
          color="danger"
        />
      </div>
      <div className="row g-4">
        <div className="col-xl-8">
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-header-clean">
              <div>
                <h4>Recommended Mentors</h4>
                <p>Alumni matching your career interests</p>
              </div>
              <Link to="/student/mentors">View All</Link>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {data.mentors.length ? (
                  data.mentors.slice(0, 2).map((m) => (
                    <div className="col-md-6" key={m.id}>
                      <MentorCard mentor={m} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No mentors available.</p>
                )}
              </div>
            </div>
          </section>
          <section className="card border-0 shadow-sm">
            <div className="card-header-clean">
              <div>
                <h4>Upcoming Events</h4>
                <p>Stay connected with your community</p>
              </div>
              <Link to="/student/events">View All</Link>
            </div>
            <div className="card-body pt-0">
              {data.events.length ? (
                data.events
                  .slice(0, 3)
                  .map((e) => <EventCard event={e} key={e.id} />)
              ) : (
                <p className="text-muted py-3">No upcoming events.</p>
              )}
            </div>
          </section>
        </div>
        <div className="col-xl-4">
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h4>Quick Actions</h4>
              {[
                ["/student/mentors", "bi-search", "Find a Mentor"],
                ["/student/mentors", "bi-person-plus", "Request Mentorship"],
                ["/student/referrals", "bi-briefcase", "Request a Referral"],
                ["/student/events", "bi-calendar-event", "View Events"],
              ].map((x) => (
                <Link className="quick-action" to={x[0]} key={x[2]}>
                  <i className={`bi ${x[1]}`} />
                  <span>{x[2]}</span>
                  <i className="bi bi-chevron-right ms-auto" />
                </Link>
              ))}
            </div>
          </section>
          <section className="card border-0 shadow-sm">
            <div className="card-header-clean">
              <h4>Notifications</h4>
              <Link to="/student/notifications">View All</Link>
            </div>
            <div className="card-body pt-0">
              {data.notifications.length ? (
                data.notifications
                  .slice(0, 3)
                  .map((n) => <NotificationCard notification={n} key={n.id} />)
              ) : (
                <p className="text-muted py-3">No notifications available.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
