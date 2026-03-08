export default function LetterGridQuestion({ data, options, selectedAnswer, onSelect }) {
  const { grid, cols, shadedPositions } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const rows = Math.ceil(grid.length / cols);
  const cellSize = 32;
  const shadedSet = new Set(shadedPositions);

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="flex gap-6 items-start">
          {/* Letter grid */}
          <div className="inline-grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
            {grid.map((letter, i) => (
              <div key={i}
                className={`flex items-center justify-center font-mono text-sm select-none ${
                  shadedSet.has(i)
                    ? 'bg-bone/20 text-bone/80 font-semibold'
                    : 'bg-bone/[0.03] text-bone/40'
                }`}
                style={{ width: cellSize, height: cellSize, border: '1px solid rgba(245,240,232,0.1)' }}>
                {letter}
              </div>
            ))}
          </div>
          {/* Shading pattern indicator */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-bone/20 text-[8px] tracking-wider mb-1">SOMBREADO</span>
            <div className="inline-grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${cols}, 12px)` }}>
              {grid.map((_, i) => (
                <div key={i}
                  className={shadedSet.has(i) ? 'bg-bone/30' : 'bg-bone/[0.05]'}
                  style={{ width: 12, height: 12, border: '1px solid rgba(245,240,232,0.05)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className={`px-5 py-3 rounded-lg border cursor-pointer transition-all font-mono text-sm tracking-widest ${
                isS
                  ? 'border-accent/50 bg-accent/10 text-accent'
                  : 'border-bone/10 bg-bone/[0.03] text-bone/50 hover:text-bone/70 hover:border-bone/20'
              }`}>
              <span className="text-[10px] mr-2 opacity-50">{letters[i]}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
