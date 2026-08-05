
export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="state-block empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-block error-state">
      <h3>We hit a snag</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-outline on-light" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
