export default function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div
        className="progress-bar bg-accent h-2 rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
