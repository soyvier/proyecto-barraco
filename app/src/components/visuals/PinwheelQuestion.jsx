import { SvgDefs } from './ShapeRenderer';

function getFill(type) {
  if (type === 'solid') return 'rgba(245,240,232,0.4)';
  if (type === 'hatched') return 'url(#pat-hatched)';
  return 'none';
}

function Pinwheel({ sectors, size = 72, highlight = false }) {
  const cx = size / 2, cy = size / 2, r = size * 0.4;
  const n = sectors.length;
  const stroke = 'rgba(245,240,232,0.5)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgDefs />
      <rect width={size} height={size} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.1)'}
        strokeWidth={1} />
      {sectors.map((fill, i) => {
        const a1 = (i * 360 / n - 90) * Math.PI / 180;
        const a2 = ((i + 1) * 360 / n - 90) * Math.PI / 180;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        const largeArc = 360/n > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return <path key={i} d={d} fill={getFill(fill)} stroke={stroke} strokeWidth={0.8} />;
      })}
      <rect x={cx-r} y={cy-r} width={r*2} height={r*2}
        fill="none" stroke={stroke} strokeWidth={1.2} />
    </svg>
  );
}

export default function PinwheelQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A','B','C','D'];
  const sz = 72;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {sequence.map((s, i) => <Pinwheel key={i} sectors={s} size={sz} />)}
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <rect width={sz} height={sz} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={sz/2} y={sz/2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const s = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <Pinwheel sectors={s} size={sz} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
