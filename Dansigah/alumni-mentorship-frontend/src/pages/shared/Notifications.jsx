import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import NotificationCard from "../../components/cards/NotificationCard";
export default function Notifications() {
  const { user } = useAuth(),
    [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get(`/notifications/user/${user.id}`)
      .then((r) => setRows(r.data))
      .catch(() => setError("Unable to load data."))
      .finally(() => setLoading(false));
  }, [user]);
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
          <h2>Notifications</h2>
          <p>Stay updated with your latest activity.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card border-0 shadow-sm px-4">
        {rows.length ? (
          rows.map((n) => <NotificationCard key={n.id} notification={n} />)
        ) : (
          <div className="empty-state">No notifications available.</div>
        )}
      </div>
    </>
  );
}
