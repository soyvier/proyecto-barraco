import { SvgDefs, renderShape } from './ShapeRenderer';

export default function CountingQuestion({ data, options, selectedAnswer, onSelect }) {
  const { shapes, targetShape } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const w = 220;
  const h = 160;

  const shapeNames = {
    circle: 'circulos', square: 'cuadrados', triangle: 'triangulos',
    diamond: 'rombos', pentagon: 'pentagonos', hexagon: 'hexagonos',
  };

  return (
    <div>
      <div className="flex justify-center mb-4">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <SvgDefs />
          <rect width={w} height={h} rx={6} fill="rgba(245,240,232,0.02)" stroke="rgba(245,240,232,0.1)" strokeWidth={1} />
          {shapes.map((s, i) => {
            const isTarget = s.shape === targetShape;
            const stroke = isTarget ? 'rgba(245,240,232,0.7)' : 'rgba(245,240,232,0.35)';
            return (
              <g key={i} transform={`rotate(${s.rotation || 0}, ${s.x}, ${s.y})`}>
                {renderShape(s.shape, s.x, s.y, 26, s.fill || 'empty', stroke)}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-center text-bone/30 text-[10px] tracking-wider mb-8">
        Cuenta los <span className="text-bone/60">{shapeNames[targetShape] || targetShape}</span>
      </p>

      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer border transition ${
                isSelected
                  ? 'bg-accent/10 border-accent/50 text-accent'
                  : 'bg-bone/3 border-bone/10 text-bone/50 hover:border-bone/20'
              }`}
            >
              <span className="text-lg font-light">{opt}</span>
              <span className={`font-mono text-[9px] tracking-wider ${isSelected ? 'text-accent/70' : 'text-bone/25'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
