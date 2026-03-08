export default function SymbolFrequencyQuestion({ data, options, selectedAnswer, onSelect }) {
  const { grid, cols } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const rows = [];
  for (let i = 0; i < grid.length; i += cols) {
    rows.push(grid.slice(i, i + cols));
  }

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-block p-4 rounded-lg border border-bone/10 bg-bone/[0.03]">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-3 justify-center">
              {row.map((sym, ci) => (
                <span key={ci} className="text-bone/70 text-xl w-6 text-center select-none">{sym}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-6 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`w-14 h-14 flex items-center justify-center rounded-lg border ${isS ? 'border-accent/50 bg-accent/10' : 'border-bone/10 bg-bone/[0.03]'}`}>
                <span className={`text-2xl ${isS ? 'text-accent' : 'text-bone/60'}`}>{opt}</span>
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
