import { SvgDefs } from './ShapeRenderer';

const FILL_MAP = {
  empty: 'rgba(245,240,232,0.05)',
  solid: 'rgba(245,240,232,0.4)',
  black: 'rgba(245,240,232,0.8)',
  gray: 'rgba(245,240,232,0.25)',
  hatched: 'url(#pat-hatched)',
  dotted: 'url(#pat-dotted)',
};

function SphereView({ sections, fills, size = 64, dividerType = 'vertical' }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const stroke = 'rgba(245,240,232,0.65)';

  // Draw sections as pie slices
  const slices = [];
  const n = fills.length;
  const angleStep = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const startAngle = i * angleStep - Math.PI / 2;
    const endAngle = (i + 1) * angleStep - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angleStep > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    slices.push(
      <path key={i} d={d} fill={FILL_MAP[fills[i]] || 'none'} stroke={stroke} strokeWidth={1} />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgDefs />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={1.5} />
      {slices}
      {/* Divider lines */}
      {dividerType === 'vertical' && (
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={stroke} strokeWidth={1.5} />
      )}
      {dividerType === 'horizontal' && (
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={stroke} strokeWidth={1.5} />
      )}
      {dividerType === 'cross' && (
        <>
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={stroke} strokeWidth={1.5} />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={stroke} strokeWidth={1.5} />
        </>
      )}
    </svg>
  );
}

export default function SphereRotationQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence, sections, dividerType, clockwise } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 64;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {sequence.map((fills, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Arrow showing rotation direction */}
            <span className="text-bone/30 text-xs mb-1">{clockwise ? '\u21BB' : '\u21BA'}</span>
            <SphereView fills={fills} sections={sections} size={cs} dividerType={dividerType} />
          </div>
        ))}
        <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
          <rect width={cs} height={cs} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={cs/2} y={cs/2} fill="rgba(245,240,232,0.3)" fontSize={22} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap mt-8">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const fills = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`rounded-lg p-1 ${isS ? 'ring-1 ring-accent/50 bg-accent/10' : ''}`}>
                <SphereView fills={fills} sections={sections} size={cs} dividerType={dividerType} />
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
