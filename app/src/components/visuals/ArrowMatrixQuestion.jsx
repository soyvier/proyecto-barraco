function ArrowCell({ data, size = 56, highlight = false }) {
  const { dir, fill, style } = data;
  const cx = size / 2, cy = size / 2;
  const stroke = 'rgba(245,240,232,0.65)';

  // Arrow body and head
  const len = size * 0.3;
  const headSize = size * 0.12;

  const fillColor = fill === 'filled' ? 'rgba(245,240,232,0.7)'
    : fill === 'gray' ? 'rgba(245,240,232,0.3)'
    : 'none';
  const strokeW = style === 'bold' ? 2.5 : style === 'double' ? 1 : 1.5;

  // Arrow pointing right, rotated by dir degrees
  const bodyW = style === 'bold' ? size * 0.12 : size * 0.08;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} rx={4}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.1)'}
        strokeWidth={1} />
      <g transform={`rotate(${dir}, ${cx}, ${cy})`}>
        {/* Arrow body */}
        <rect x={cx - len} y={cy - bodyW / 2} width={len * 1.4} height={bodyW}
          fill={fillColor} stroke={stroke} strokeWidth={strokeW} rx={1} />
        {/* Arrow head */}
        <polygon
          points={`${cx + len * 0.6},${cy - headSize * 1.2} ${cx + len * 1.1},${cy} ${cx + len * 0.6},${cy + headSize * 1.2}`}
          fill={fillColor} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
        {style === 'double' && (
          <rect x={cx - len + 3} y={cy - bodyW / 2 + 3} width={len * 1.2} height={Math.max(1, bodyW - 6)}
            fill="none" stroke={stroke} strokeWidth={0.8} rx={1} />
        )}
      </g>
    </svg>
  );
}

export default function ArrowMatrixQuestion({ data, options, selectedAnswer, onSelect }) {
  const { grid } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 56;

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-grid grid-cols-3 gap-[4px]">
          {grid.map((cell, i) => (
            <ArrowCell key={i} data={cell} size={cs} />
          ))}
          <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
            <rect width={cs} height={cs} rx={4} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={cs/2} y={cs/2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const cell = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <ArrowCell data={cell} size={cs} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
