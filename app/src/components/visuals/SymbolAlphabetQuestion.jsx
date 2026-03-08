function SymbolCell({ elements, size = 56 }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const stroke = 'rgba(245,240,232,0.6)';
  const m = s * 0.15; // margin

  const elemRenderers = {
    'line-top': <line x1={m} y1={m} x2={s-m} y2={m} stroke={stroke} strokeWidth={1.5} />,
    'line-bottom': <line x1={m} y1={s-m} x2={s-m} y2={s-m} stroke={stroke} strokeWidth={1.5} />,
    'line-left': <line x1={m} y1={m} x2={m} y2={s-m} stroke={stroke} strokeWidth={1.5} />,
    'line-right': <line x1={s-m} y1={m} x2={s-m} y2={s-m} stroke={stroke} strokeWidth={1.5} />,
    'diag-tl': <line x1={m} y1={m} x2={cx} y2={cy} stroke={stroke} strokeWidth={1.5} />,
    'diag-tr': <line x1={s-m} y1={m} x2={cx} y2={cy} stroke={stroke} strokeWidth={1.5} />,
    'diag-bl': <line x1={m} y1={s-m} x2={cx} y2={cy} stroke={stroke} strokeWidth={1.5} />,
    'diag-br': <line x1={s-m} y1={s-m} x2={cx} y2={cy} stroke={stroke} strokeWidth={1.5} />,
    'dot-tl': <circle cx={m+3} cy={m+3} r={2.5} fill={stroke} />,
    'dot-tr': <circle cx={s-m-3} cy={m+3} r={2.5} fill={stroke} />,
    'dot-bl': <circle cx={m+3} cy={s-m-3} r={2.5} fill={stroke} />,
    'dot-br': <circle cx={s-m-3} cy={s-m-3} r={2.5} fill={stroke} />,
    'dot-center': <circle cx={cx} cy={cy} r={2.5} fill={stroke} />,
    'tri-up': <polygon points={`${cx},${m+2} ${cx-5},${m+10} ${cx+5},${m+10}`} fill={stroke} />,
    'tri-down': <polygon points={`${cx},${s-m-2} ${cx-5},${s-m-10} ${cx+5},${s-m-10}`} fill={stroke} />,
    'tri-left': <polygon points={`${m+2},${cy} ${m+10},${cy-5} ${m+10},${cy+5}`} fill={stroke} />,
    'tri-right': <polygon points={`${s-m-2},${cy} ${s-m-10},${cy-5} ${s-m-10},${cy+5}`} fill={stroke} />,
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect width={s} height={s} rx={3} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.12)" strokeWidth={1} />
      {elements.map((el, i) => (
        <g key={i}>{elemRenderers[el] || null}</g>
      ))}
    </svg>
  );
}

function AlphabetStrip({ alphabet, size = 20 }) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return (
    <div className="flex flex-wrap justify-center gap-[2px] mb-6">
      {letters.map(l => (
        <div key={l} className="flex flex-col items-center">
          <span className="text-bone/40 text-[9px] font-mono">{l}</span>
          <SymbolCell elements={alphabet[l] || []} size={size} />
        </div>
      ))}
    </div>
  );
}

export default function SymbolAlphabetQuestion({ data, options, selectedAnswer, onSelect }) {
  const { alphabet } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cs = 64;

  return (
    <div>
      <AlphabetStrip alphabet={alphabet} size={24} />
      <div className="flex justify-center gap-5 flex-wrap mt-6">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const elems = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`rounded-lg p-1 ${isS ? 'ring-1 ring-accent/50 bg-accent/10' : ''}`}>
                <SymbolCell elements={elems} size={cs} />
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
