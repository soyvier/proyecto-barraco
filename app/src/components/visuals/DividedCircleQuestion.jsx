import { SvgDefs } from './ShapeRenderer';

function getFill(type) {
  if (type === 'solid') return 'rgba(245,240,232,0.7)';
  if (type === 'black') return 'rgba(245,240,232,0.85)';
  if (type === 'gray') return 'rgba(245,240,232,0.3)';
  if (type === 'hatched') return 'url(#pat-hatched)';
  if (type === 'dotted') return 'url(#pat-dotted)';
  return 'none';
}

function RotationArrow({ cx, cy, r, clockwise, size }) {
  // Small curved arrow above the circle showing rotation direction
  const arrowY = cy - r - 6;
  const arrowR = 5;
  if (clockwise) {
    return (
      <g>
        <line x1={cx - 1} y1={cy - r - 2} x2={cx - 1} y2={cy - r - 10} stroke="rgba(245,240,232,0.4)" strokeWidth={1} />
        <path d={`M ${cx - 1} ${arrowY} A ${arrowR} ${arrowR} 0 0 1 ${cx + 5} ${arrowY + 3}`}
          fill="none" stroke="rgba(245,240,232,0.4)" strokeWidth={0.8} />
        <polygon points={`${cx + 5},${arrowY + 1} ${cx + 5},${arrowY + 5} ${cx + 7},${arrowY + 3}`}
          fill="rgba(245,240,232,0.4)" />
      </g>
    );
  }
  return (
    <g>
      <line x1={cx + 1} y1={cy - r - 2} x2={cx + 1} y2={cy - r - 10} stroke="rgba(245,240,232,0.4)" strokeWidth={1} />
      <path d={`M ${cx + 1} ${arrowY} A ${arrowR} ${arrowR} 0 0 0 ${cx - 5} ${arrowY + 3}`}
        fill="none" stroke="rgba(245,240,232,0.4)" strokeWidth={0.8} />
      <polygon points={`${cx - 5},${arrowY + 1} ${cx - 5},${arrowY + 5} ${cx - 7},${arrowY + 3}`}
        fill="rgba(245,240,232,0.4)" />
    </g>
  );
}

function DividedCircle({ sectors, size = 72, highlight = false, showArrow = false, clockwise = true }) {
  const cx = size / 2;
  const cy = size / 2 + (showArrow ? 4 : 0);
  const r = size * 0.34;
  const stroke = 'rgba(245,240,232,0.65)';
  const n = sectors.length;

  const paths = sectors.map((fill, i) => {
    const startAngle = (i * 360 / n - 90) * Math.PI / 180;
    const endAngle = ((i + 1) * 360 / n - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = (360 / n) > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={getFill(fill)} stroke={stroke} strokeWidth={1.2} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgDefs />
      <rect
        width={size} height={size} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.1)'}
        strokeWidth={1}
      />
      {showArrow && <RotationArrow cx={cx} cy={cy} r={r} clockwise={clockwise} size={size} />}
      {paths}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}

export default function DividedCircleQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence, showArrow, clockwise } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const size = 72;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {sequence.map((sectors, i) => (
          <DividedCircle key={i} sectors={sectors} size={size} showArrow={showArrow} clockwise={clockwise} />
        ))}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect width={size} height={size} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={size / 2} y={size / 2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>

      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const sectors = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <DividedCircle sectors={sectors} size={size} highlight={isSelected} />
              <span className={`font-mono text-xs tracking-wider ${isSelected ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
