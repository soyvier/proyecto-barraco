import { SvgDefs, renderShape } from './ShapeRenderer';

function ShapeIcon({ shape, cx, cy, size = 24 }) {
  return renderShape(shape, cx, cy, size * 1.8, 'solid', 'rgba(245,240,232,0.7)', 'medium');
}

function EquationRow({ equation, y, width }) {
  const elements = equation.elements;
  const totalW = elements.length * 32;
  const startX = (width - totalW) / 2 + 16;

  return (
    <g transform={`translate(0, ${y})`}>
      {elements.map((el, i) => {
        const x = startX + i * 32;
        if (el.type === 'shape') {
          return <g key={i}><ShapeIcon shape={el.shape} cx={x} cy={16} size={22} /></g>;
        }
        if (el.type === 'operator') {
          return (
            <text key={i} x={x} y={22} fill="rgba(245,240,232,0.6)" fontSize={18} fontWeight="bold" textAnchor="middle">
              {el.value}
            </text>
          );
        }
        if (el.type === 'equals') {
          return (
            <text key={i} x={x} y={22} fill="rgba(245,240,232,0.6)" fontSize={18} fontWeight="bold" textAnchor="middle">
              =
            </text>
          );
        }
        if (el.type === 'number') {
          return (
            <text key={i} x={x} y={22} fill="rgba(245,240,232,0.85)" fontSize={18} fontWeight="bold" textAnchor="middle">
              {el.value}
            </text>
          );
        }
        if (el.type === 'unknown') {
          return (
            <text key={i} x={x} y={22} fill="rgba(201,168,76,0.8)" fontSize={18} fontWeight="bold" textAnchor="middle">
              ?
            </text>
          );
        }
        return null;
      })}
    </g>
  );
}

export default function ShapeAlgebraQuestion({ data, options, selectedAnswer, onSelect }) {
  const { equations } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const eqH = 40;
  const totalH = equations.length * eqH + 20;
  const w = 320;

  return (
    <div>
      <div className="flex justify-center mb-10">
        <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`}>
          <SvgDefs />
          <rect width={w} height={totalH} rx={8} fill="rgba(245,240,232,0.03)" stroke="rgba(245,240,232,0.1)" strokeWidth={1} />
          {equations.map((eq, i) => (
            <EquationRow key={i} equation={eq} y={10 + i * eqH} width={w} />
          ))}
        </svg>
      </div>
      <div className="flex justify-center gap-6 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`w-14 h-14 flex items-center justify-center rounded-lg border ${isS ? 'border-accent/50 bg-accent/10' : 'border-bone/10 bg-bone/[0.03]'}`}>
                <span className={`text-2xl font-bold ${isS ? 'text-accent' : 'text-bone/60'}`}>{opt}</span>
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
