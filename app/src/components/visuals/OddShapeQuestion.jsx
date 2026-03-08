import { ShapeCell } from './ShapeRenderer';

export default function OddShapeQuestion({ data, options, selectedAnswer, onSelect }) {
  const letters = ['A','B','C','D'];
  return (
    <div className="flex justify-center gap-5 flex-wrap">
      {options.map((opt,i) => {
        const it = typeof opt==='string' ? JSON.parse(opt) : opt;
        const isS = selectedAnswer===i;
        return (
          <button key={i} onClick={()=>onSelect(i)} className="flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer">
            <ShapeCell shape={it.shape} fill={it.fill||'empty'} rotation={it.rotation||0} shapeSize={it.size||'medium'} highlight={isS} size={76} />
            <span className={`font-mono text-xs tracking-wider ${isS?'text-accent':'text-bone/30'}`}>{letters[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
