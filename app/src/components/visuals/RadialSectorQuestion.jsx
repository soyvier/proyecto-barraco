import { SvgDefs } from './ShapeRenderer';

const FILL_MAP = {
  empty: 'rgba(245,240,232,0.03)',
  solid: 'rgba(245,240,232,0.5)',
  hatched: 'url(#pat-hatched)',
};

function RadialSquare({ sectors, size = 60, highlight = false }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const stroke = 'rgba(245,240,232,0.5)';

  // 8 sectors: triangles from center to edges/corners
  // Order: top, top-right, right, bottom-right, bottom, bottom-left, left, top-left
  // Each sector is a triangle: center -> edge point A -> edge point B
  const points = [
    [cx, 0],           // top center
    [s, 0],            // top right corner
    [s, cy],           // right center
    [s, s],            // bottom right corner
    [cx, s],           // bottom center
    [0, s],            // bottom left corner
    [0, cy],           // left center
    [0, 0],            // top left corner
  ];

  const sectorPaths = [];
  for (let i = 0; i < 8; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % 8];
    sectorPaths.push(`M${cx},${cy} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Z`);
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <SvgDefs />
      <rect width={s} height={s} rx={3}
        fill={highlight ? 'rgba(201,168,76,0.08)' : 'rgba(245,240,232,0.01)'}
        stroke={highlight ? 'rgba(201,168,76,0.4)' : 'rgba(245,240,232,0.12)'}
        strokeWidth={1} />
      {sectors.map((fill, i) => (
        <path key={i} d={sectorPaths[i]} fill={FILL_MAP[fill] || 'none'} stroke={stroke} strokeWidth={0.8} />
      ))}
      {/* Dividing lines: horizontal, vertical, two diagonals */}
      <line x1={0} y1={cy} x2={s} y2={cy} stroke={stroke} strokeWidth={1} />
      <line x1={cx} y1={0} x2={cx} y2={s} stroke={stroke} strokeWidth={1} />
      <line x1={0} y1={0} x2={s} y2={s} stroke={stroke} strokeWidth={0.8} />
      <line x1={s} y1={0} x2={0} y2={s} stroke={stroke} strokeWidth={0.8} />
    </svg>
  );
}

export default function RadialSectorQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 58;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {sequence.map((sectors, i) => (
          <RadialSquare key={i} sectors={sectors} size={cs} />
        ))}
        <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
          <rect width={cs} height={cs} rx={3} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={cs/2} y={cs/2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const sectors = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <RadialSquare sectors={sectors} size={cs} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
