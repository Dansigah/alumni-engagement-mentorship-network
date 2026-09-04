export default function LoadingState({ message = "Loading information..." }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
