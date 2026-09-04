export default function NotificationCard({ notification }) {
  return (
    <div className="d-flex gap-3 py-3 border-bottom">
      <span
        className={`notification-dot ${notification.readStatus ? "read" : ""}`}
      />
      <div>
        <p className="mb-1">{notification.message}</p>
        <small className="text-muted">
          {notification.createdAt
            ? new Date(notification.createdAt).toLocaleString()
            : ""}
        </small>
      </div>
    </div>
  );
}
