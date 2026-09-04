export default function EmptyState({ icon = "bi-inbox", title = "Nothing here yet", message, action }) {
  return (
    <div className="state-panel state-panel-compact">
      <span className="state-icon"><i className={`bi ${icon}`} /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
