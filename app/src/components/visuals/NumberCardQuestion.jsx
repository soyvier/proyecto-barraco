function NumberCard({ top, bottom, size = 48, highlight = false }) {
  const h = size;
  const half = h / 2;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
      <rect width={size} height={h} rx={4}
        fill={highlight ? 'rgba(201,168,76,0.12)' : 'rgba(245,240,232,0.04)'}
        stroke={highlight ? 'rgba(201,168,76,0.6)' : 'rgba(245,240,232,0.2)'}
        strokeWidth={1.5} />
      <line x1={4} y1={half} x2={size - 4} y2={half} stroke="rgba(245,240,232,0.15)" strokeWidth={1} />
      <text x={size / 2} y={half * 0.55} fill="rgba(245,240,232,0.85)" fontSize={16} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
        {top}
      </text>
      <text x={size / 2} y={half * 1.45} fill="rgba(245,240,232,0.85)" fontSize={16} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
        {bottom}
      </text>
    </svg>
  );
}

export default function NumberCardQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const sz = 48;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {sequence.map((d, i) => (
          <NumberCard key={i} top={d[0]} bottom={d[1]} size={sz} />
        ))}
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <rect width={sz} height={sz} rx={4} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={sz / 2} y={sz / 2} fill="rgba(245,240,232,0.3)" fontSize={18} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const d = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <NumberCard top={d[0]} bottom={d[1]} size={sz} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
