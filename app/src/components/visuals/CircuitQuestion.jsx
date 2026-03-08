function Circuit({ corners, lines, size = 72, highlight = false }) {
  const pad = 14;
  const w = size - pad * 2;
  const positions = [
    { x: pad, y: pad },       // tl
    { x: size - pad, y: pad }, // tr
    { x: pad, y: size - pad }, // bl
    { x: size - pad, y: size - pad }, // br
  ];
  const lineMap = {
    'tl-tr': [0, 1], 'tl-bl': [0, 2], 'tl-br': [0, 3],
    'tr-bl': [1, 2], 'tr-br': [1, 3], 'bl-br': [2, 3],
  };
  const stroke = 'rgba(245,240,232,0.5)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.12)'}
        strokeWidth={1} />
      {/* Rectangle outline */}
      <rect x={pad} y={pad} width={w} height={w} fill="none" stroke={stroke} strokeWidth={1.5} rx={2} />
      {/* Internal lines */}
      {(lines || []).map((l, i) => {
        const pair = lineMap[l];
        if (!pair) return null;
        const [a, b] = pair;
        return <line key={i} x1={positions[a].x} y1={positions[a].y} x2={positions[b].x} y2={positions[b].y} stroke={stroke} strokeWidth={1} />;
      })}
      {/* Corner circles */}
      {positions.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5}
          fill={corners[i] ? 'rgba(245,240,232,0.85)' : 'none'}
          stroke="rgba(245,240,232,0.7)" strokeWidth={1.2} />
      ))}
    </svg>
  );
}

export default function CircuitQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const sz = 72;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {sequence.map((c, i) => (
          <Circuit key={i} corners={c.corners} lines={c.lines} size={sz} />
        ))}
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <rect width={sz} height={sz} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={sz / 2} y={sz / 2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const c = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <Circuit corners={c.corners} lines={c.lines} size={sz} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
