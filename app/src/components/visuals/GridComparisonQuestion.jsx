function SymbolGrid({ grid, cols, size = 120 }) {
  const rows = [];
  for (let i = 0; i < grid.length; i += cols) {
    rows.push(grid.slice(i, i + cols));
  }
  const cellSize = size / cols;

  return (
    <div className="inline-block p-2 rounded border border-bone/10 bg-bone/[0.03]" style={{ width: size }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center">
          {row.map((sym, ci) => (
            <span key={ci} className="text-bone/60 select-none text-center" style={{ width: cellSize, fontSize: cellSize * 0.6 }}>{sym}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GridComparisonQuestion({ data, options, selectedAnswer, onSelect }) {
  const { grids, cols } = data;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {grids.map((g, i) => (
          <SymbolGrid key={i} grid={g} cols={cols} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-3">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className={`w-full max-w-sm px-4 py-3 rounded-lg border cursor-pointer text-left transition-all ${isS ? 'border-accent/50 bg-accent/10 text-accent' : 'border-bone/10 bg-bone/[0.03] text-bone/50 hover:text-bone/70 hover:border-bone/20'}`}>
              <span className="font-mono text-xs mr-2">{letters[i]}</span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
