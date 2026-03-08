import { SvgDefs, renderShape } from './ShapeRenderer';

function ShapeCard({ card, size = 76, highlight = false }) {
  const half = size / 2;
  const stroke = 'rgba(245,240,232,0.2)';
  const cells = [
    { key: 'tl', cx: half * 0.5, cy: half * 0.5 },
    { key: 'tr', cx: half * 1.5, cy: half * 0.5 },
    { key: 'bl', cx: half * 0.5, cy: half * 1.5 },
    { key: 'br', cx: half * 1.5, cy: half * 1.5 },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgDefs />
      <rect width={size} height={size} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.12)'}
        strokeWidth={1} />
      {/* Dividing lines */}
      <line x1={half} y1={4} x2={half} y2={size - 4} stroke={stroke} strokeWidth={0.5} />
      <line x1={4} y1={half} x2={size - 4} y2={half} stroke={stroke} strokeWidth={0.5} />
      {cells.map(({ key, cx, cy }) => {
        const cell = card[key];
        if (!cell) return null;
        return (
          <g key={key}>
            {renderShape(cell.shape, cx, cy, half * 0.8, 'solid', 'rgba(245,240,232,0.6)', 'medium')}
            {cell.count > 1 && (
              <text x={cx + half * 0.25} y={cy - half * 0.2} fill="rgba(245,240,232,0.4)" fontSize={9} fontWeight="bold">{cell.count}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ShapeCardQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const sz = 76;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {sequence.map((card, i) => <ShapeCard key={i} card={card} size={sz} />)}
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <rect width={sz} height={sz} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={sz / 2} y={sz / 2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const card = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <ShapeCard card={card} size={sz} highlight={isS} />
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
