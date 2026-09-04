export default function ErrorState({ message = "We could not load this information.", onRetry }) {
  return (
    <div className="alert app-alert alert-danger" role="alert">
      <i className="bi bi-exclamation-circle" />
      <div><strong>Something went wrong</strong><div>{message}</div></div>
      {onRetry && <button className="btn btn-sm btn-outline-danger ms-auto" onClick={onRetry}>Try again</button>}
    </div>
  );
}
