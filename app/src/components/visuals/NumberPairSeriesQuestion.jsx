function PairBox({ pair, size = 48, isQuestion = false }) {
  const { top, bot, shaded } = pair || {};
  const s = size;
  const half = s / 2;
  const stroke = 'rgba(245,240,232,0.4)';

  if (isQuestion) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect width={s} height={s} rx={3} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
        <text x={half} y={half} fill="rgba(245,240,232,0.3)" fontSize={18} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
      </svg>
    );
  }

  const bg = shaded ? 'rgba(245,240,232,0.15)' : 'rgba(245,240,232,0.03)';
  const textColor = shaded ? 'rgba(245,240,232,0.85)' : 'rgba(245,240,232,0.6)';
  const fontW = shaded ? '700' : '400';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect width={s} height={s} rx={3} fill={bg} stroke={stroke} strokeWidth={1} />
      <line x1={0} y1={half} x2={s} y2={half} stroke={stroke} strokeWidth={0.5} />
      <text x={half} y={half * 0.55} fill={textColor} fontSize={14} fontWeight={fontW} fontFamily="monospace" textAnchor="middle" dominantBaseline="central">
        {top}
      </text>
      <text x={half} y={half * 1.45} fill={textColor} fontSize={14} fontWeight={fontW} fontFamily="monospace" textAnchor="middle" dominantBaseline="central">
        {bot}
      </text>
    </svg>
  );
}

export default function NumberPairSeriesQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 48;

  return (
    <div>
      <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
        {sequence.map((pair, i) => (
          <PairBox key={i} pair={pair} size={cs} />
        ))}
        <PairBox isQuestion size={cs} />
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const pair = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`rounded-lg p-1 ${isS ? 'ring-1 ring-accent/50 bg-accent/10' : ''}`}>
                <PairBox pair={pair} size={cs} />
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
