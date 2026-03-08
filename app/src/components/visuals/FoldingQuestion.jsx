function HalfGrid({ cells, axis, gridSize, boxSize = 80 }) {
  const cellSize = (boxSize - 10) / gridSize;
  const pad = 5;
  const halfCols = Math.ceil(gridSize / 2);

  return (
    <svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`}>
      <rect
        width={boxSize} height={boxSize} rx={5}
        fill="rgba(245,240,232,0.03)"
        stroke="rgba(245,240,232,0.1)"
        strokeWidth={1}
      />
      {axis === 'vertical' ? (
        <>
          {/* Show left half */}
          {cells.map((filled, i) => {
            const row = Math.floor(i / halfCols);
            const col = i % halfCols;
            if (row >= gridSize) return null;
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
          {/* Fold line */}
          <line
            x1={pad + halfCols * cellSize} y1={pad}
            x2={pad + halfCols * cellSize} y2={pad + gridSize * cellSize}
            stroke="rgba(201,168,76,0.4)" strokeWidth={1} strokeDasharray="4 3"
          />
          {/* Arrow */}
          <text x={pad + halfCols * cellSize + 8} y={boxSize / 2} fill="rgba(201,168,76,0.3)" fontSize={14} dominantBaseline="central">→</text>
        </>
      ) : (
        <>
          {/* Show top half */}
          {cells.map((filled, i) => {
            const halfRows = Math.ceil(gridSize / 2);
            const row = Math.floor(i / halfCols);
            const col = i % halfCols;
            if (row >= halfRows) return null;
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
          {/* Fold line */}
          <line
            x1={pad} y1={pad + Math.ceil(gridSize / 2) * cellSize}
            x2={pad + gridSize * cellSize} y2={pad + Math.ceil(gridSize / 2) * cellSize}
            stroke="rgba(201,168,76,0.4)" strokeWidth={1} strokeDasharray="4 3"
          />
          <text x={boxSize / 2} y={pad + Math.ceil(gridSize / 2) * cellSize + 14} fill="rgba(201,168,76,0.3)" fontSize={14} textAnchor="middle">↓</text>
        </>
      )}
    </svg>
  );
}

function FullGrid({ cells, gridSize, boxSize = 70, highlight = false }) {
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

export default function FoldingQuestion({ data, options, selectedAnswer, onSelect }) {
  const { halfGrid, axis, size } = data;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="flex flex-col items-center gap-3 mb-10">
        <HalfGrid cells={halfGrid} axis={axis} gridSize={size} boxSize={90} />
        <p className="text-bone/30 text-[10px] tracking-wider">
          Desplegar por el eje {axis === 'vertical' ? 'vertical ↔' : 'horizontal ↕'}
        </p>
      </div>

      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const cells = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <FullGrid cells={cells} gridSize={size} boxSize={72} highlight={isSelected} />
              <span className={`font-mono text-xs tracking-wider ${isSelected ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
