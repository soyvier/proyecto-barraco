export default function Timer({ formatted, isWarning, isCritical }) {
  const colorClass = isCritical
    ? 'bg-danger text-white timer-warning'
    : isWarning
      ? 'bg-warning text-white'
      : 'bg-primary text-white';

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-lg ${colorClass}`}
    >
      {formatted}
    </div>
  );
}
