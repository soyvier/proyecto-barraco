function DominoDots({ value, x, y, size = 44 }) {
  const r = size * 0.09;
  const color = 'rgba(245,240,232,0.85)';
  const positions = {
    0: [],
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]],
  };
  const dots = positions[value] || [];
  return dots.map((p, i) => (
    <circle key={i} cx={x + p[0] * size} cy={y + p[1] * size} r={r} fill={color} />
  ));
}

function Domino({ top, bottom, x = 0, y = 0, size = 50, highlight = false, unknown = false }) {
  const h = size * 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={size} height={h} rx={5} ry={5}
        fill={highlight ? 'rgba(201,168,76,0.12)' : 'rgba(245,240,232,0.04)'}
        stroke={highlight ? 'rgba(201,168,76,0.6)' : 'rgba(245,240,232,0.2)'}
        strokeWidth={1.5}
      />
      <line x1={5} y1={size} x2={size - 5} y2={size} stroke="rgba(245,240,232,0.18)" strokeWidth={1} />
      {unknown ? (
        <text x={size / 2} y={size} fill="rgba(245,240,232,0.4)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
      ) : (
        <>
          <DominoDots value={top} x={3} y={3} size={size - 6} />
          <DominoDots value={bottom} x={3} y={size + 3} size={size - 6} />
        </>
      )}
    </g>
  );
}

export default function DominoQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const tileW = 56;
  const tileH = 112;

  return (
    <div>
      {/* Sequence */}
      <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
        {sequence.map((d, i) => (
          <svg key={i} width={tileW} height={tileH} viewBox={`0 0 ${tileW} ${tileH}`}>
            <Domino top={d[0]} bottom={d[1]} x={3} y={3} />
          </svg>
        ))}
        <svg width={tileW} height={tileH} viewBox={`0 0 ${tileW} ${tileH}`}>
          <Domino top={0} bottom={0} x={3} y={3} unknown />
        </svg>
      </div>

      {/* Options */}
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const [t, b] = opt.split(',').map(Number);
          const isSelected = selectedAnswer === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0"
            >
              <svg width={tileW} height={tileH} viewBox={`0 0 ${tileW} ${tileH}`}>
                <Domino top={t} bottom={b} x={3} y={3} highlight={isSelected} />
              </svg>
              <span className={`font-mono text-xs tracking-wider ${isSelected ? 'text-accent' : 'text-bone/30'}`}>
                {letters[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
