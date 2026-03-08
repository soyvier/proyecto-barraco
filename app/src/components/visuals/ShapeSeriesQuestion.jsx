import { ShapeCell } from './ShapeRenderer';

export default function ShapeSeriesQuestion({ data, options, selectedAnswer, onSelect }) {
  const { sequence } = data;
  const letters = ['A','B','C','D'];
  const cs = 64;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {sequence.map((it,i) => (
          <ShapeCell key={i} shape={it.shape} rotation={it.rotation||0} fill={it.fill||'empty'} shapeSize={it.size||'medium'} dots={it.dots} border={it.border||'solid'} innerShape={it.innerShape} innerFill={it.innerFill} dotPos={it.dotPos} arrowDir={it.arrowDir} size={cs} />
        ))}
        <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
          <rect width={cs} height={cs} rx={5} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={cs/2} y={cs/2} fill="rgba(245,240,232,0.3)" fontSize={22} fontWeight="300" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt,i) => {
          const isS = selectedAnswer===i;
          const it = typeof opt==='string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={()=>onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <ShapeCell shape={it.shape} rotation={it.rotation||0} fill={it.fill||'empty'} shapeSize={it.size||'medium'} dots={it.dots} border={it.border||'solid'} innerShape={it.innerShape} innerFill={it.innerFill} dotPos={it.dotPos} arrowDir={it.arrowDir} highlight={isS} size={cs} />
              <span className={`font-mono text-xs tracking-wider ${isS?'text-accent':'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
