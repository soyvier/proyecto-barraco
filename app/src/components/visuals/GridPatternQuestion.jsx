function GridBox({ cells, gridSize, boxSize = 70, highlight = false }) {
  const cellSize = (boxSize - 8) / gridSize;
  const pad = 4;

  return (
    <svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`}>
      <rect
        width={boxSize} height={boxSize} rx={5}
        fill={highlight ? 'rgba(201,168,76,0.1)' : 'rgba(245,240,232,0.03)'}
        stroke={highlight ? 'rgba(201,168,76,0.5)' : 'rgba(245,240,232,0.1)'}
        strokeWidth={1}
      />
      {cells.map((filled, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        return (
          <rect
            key={i}
            x={pad + col * cellSize + 1}
            y={pad + row * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            rx={1}
            fill={filled ? 'rgba(245,240,232,0.6)' : 'rgba(245,240,232,0.04)'}
            stroke="rgba(245,240,232,0.15)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

export default function GridPatternQuestion({ data, options, selectedAnswer, onSelect }) {
  const { grids, size } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const boxSize = 72;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {grids.map((g, i) => (
          <GridBox key={i} cells={g} gridSize={size} boxSize={boxSize} />
        ))}
        <svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`}>
          <rect width={boxSize} height={boxSize} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={boxSize / 2} y={boxSize / 2} fill="rgba(245,240,232,0.3)" fontSize={20} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>

      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const cells = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <GridBox cells={cells} gridSize={size} boxSize={boxSize} highlight={isSelected} />
              <span className={`font-mono text-xs tracking-wider ${isSelected ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
