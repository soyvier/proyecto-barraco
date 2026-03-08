function ClockFace({ time, size = 60, highlight = false }) {
  const cx = size / 2, cy = size / 2, r = size * 0.4;
  const stroke = 'rgba(245,240,232,0.6)';

  // Hour hand: shorter, thicker
  const hAngle = ((time.h % 12) + time.m / 60) * 30 - 90; // degrees
  const hRad = (hAngle * Math.PI) / 180;
  const hLen = r * 0.55;
  const hx = cx + hLen * Math.cos(hRad);
  const hy = cy + hLen * Math.sin(hRad);

  // Minute hand: longer, thinner
  const mAngle = time.m * 6 - 90;
  const mRad = (mAngle * Math.PI) / 180;
  const mLen = r * 0.8;
  const mx = cx + mLen * Math.cos(mRad);
  const my = cy + mLen * Math.sin(mRad);

  // Hour markers
  const markers = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    const inner = r * 0.85;
    const outer = r * 0.95;
    return {
      x1: cx + inner * Math.cos(a), y1: cy + inner * Math.sin(a),
      x2: cx + outer * Math.cos(a), y2: cy + outer * Math.sin(a),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.1)'}
        strokeWidth={1} />
      {/* Clock circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={1.5} />
      {/* Hour markers */}
      {markers.map((m, i) => (
        <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke={stroke} strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />
      ))}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill={stroke} />
    </svg>
  );
}

export default function ClockSeriesQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 60;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {sequence.map((time, i) => (
          <ClockFace key={i} time={time} size={cs} />
        ))}
        <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
          <rect width={cs} height={cs} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={cs/2} y={cs/2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const time = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <ClockFace time={time} size={cs} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
