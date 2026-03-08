const PIE_COLORS = [
  'rgba(245,240,232,0.6)',
  'rgba(245,240,232,0.3)',
  'rgba(201,168,76,0.5)',
  'rgba(245,240,232,0.12)',
];

function BarChart({ years, data, width = 200, height = 130 }) {
  const max = Math.max(...data);
  const barW = (width - 40) / data.length - 8;
  const chartH = height - 30;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <text x={width / 2} y={12} fill="rgba(245,240,232,0.5)" fontSize={8} textAnchor="middle" fontWeight="500">Inversion</text>
      {/* Y axis */}
      <line x1={30} y1={18} x2={30} y2={chartH + 18} stroke="rgba(245,240,232,0.2)" strokeWidth={0.5} />
      {/* Bars */}
      {data.map((v, i) => {
        const bh = (v / max) * (chartH - 5);
        const x = 38 + i * ((width - 40) / data.length);
        const y = chartH + 18 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} fill="rgba(245,240,232,0.25)" stroke="rgba(245,240,232,0.4)" strokeWidth={0.5} rx={1} />
            <text x={x + barW / 2} y={y - 3} fill="rgba(245,240,232,0.5)" fontSize={6} textAnchor="middle">{v.toLocaleString('es-ES')}</text>
            <text x={x + barW / 2} y={chartH + 28} fill="rgba(245,240,232,0.4)" fontSize={6} textAnchor="middle">{years[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ years, data, width = 170, height = 130 }) {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const chartH = height - 35;
  const chartW = width - 45;

  const points = data.map((v, i) => {
    const x = 35 + (i / (data.length - 1)) * chartW;
    const y = 18 + chartH - ((v - min) / (max - min)) * chartH;
    return { x, y, v };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <text x={width / 2} y={12} fill="rgba(245,240,232,0.5)" fontSize={8} textAnchor="middle" fontWeight="500">Personal</text>
      <line x1={30} y1={18} x2={30} y2={chartH + 18} stroke="rgba(245,240,232,0.2)" strokeWidth={0.5} />
      <line x1={30} y1={chartH + 18} x2={width - 5} y2={chartH + 18} stroke="rgba(245,240,232,0.2)" strokeWidth={0.5} />
      <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(245,240,232,0.5)" strokeWidth={1.5} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="rgba(245,240,232,0.6)" />
          <text x={p.x} y={p.y - 7} fill="rgba(245,240,232,0.5)" fontSize={6} textAnchor="middle">{p.v.toLocaleString('es-ES')}</text>
          <text x={p.x} y={chartH + 28} fill="rgba(245,240,232,0.4)" fontSize={6} textAnchor="middle">{years[i]}</text>
        </g>
      ))}
    </svg>
  );
}

function PieChart({ labels, data, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.35;
  let cumAngle = -Math.PI / 2;
  const slices = [];

  for (let i = 0; i < data.length; i++) {
    const angle = (data[i] / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;

    const midAngle = cumAngle + angle / 2;
    const lx = cx + (r + 14) * Math.cos(midAngle);
    const ly = cy + (r + 14) * Math.sin(midAngle);

    slices.push(
      <g key={i}>
        <path d={d} fill={PIE_COLORS[i]} stroke="rgba(245,240,232,0.3)" strokeWidth={0.5} />
        <text x={lx} y={ly} fill="rgba(245,240,232,0.5)" fontSize={6} textAnchor="middle" dominantBaseline="middle">
          {labels[i]} {data[i]}%
        </text>
      </g>
    );
    cumAngle += angle;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <text x={cx} y={8} fill="rgba(245,240,232,0.5)" fontSize={7} textAnchor="middle" fontWeight="500">Por regiones</text>
      {slices}
    </svg>
  );
}

export default function ChartQuestion({ data, options, selectedAnswer, onSelect }) {
  const { years, barData, lineData, pieLabels, pieData } = data;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="flex justify-center gap-3 mb-8 flex-wrap items-end">
        <BarChart years={years} data={barData} />
        <LineChart years={years} data={lineData} />
        <PieChart labels={pieLabels} data={pieData} />
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
