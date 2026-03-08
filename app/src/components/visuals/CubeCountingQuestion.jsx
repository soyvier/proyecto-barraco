function IsoCube({ x, y, size, shade = 0 }) {
  // Draw one isometric cube at pixel position (x,y) = top corner
  const s = size;
  const h = s * 0.6; // vertical height of cube

  // Top face
  const top = `${x},${y} ${x + s / 2},${y - h / 2} ${x + s},${y} ${x + s / 2},${y + h / 2}`;
  // Left face
  const left = `${x},${y} ${x + s / 2},${y + h / 2} ${x + s / 2},${y + h / 2 + h} ${x},${y + h}`;
  // Right face
  const right = `${x + s},${y} ${x + s / 2},${y + h / 2} ${x + s / 2},${y + h / 2 + h} ${x + s},${y + h}`;

  const topFill = `rgba(245,240,232,${0.25 - shade * 0.03})`;
  const leftFill = `rgba(245,240,232,${0.12 - shade * 0.02})`;
  const rightFill = `rgba(245,240,232,${0.18 - shade * 0.025})`;
  const stroke = 'rgba(245,240,232,0.5)';

  return (
    <g>
      <polygon points={top} fill={topFill} stroke={stroke} strokeWidth={0.8} />
      <polygon points={left} fill={leftFill} stroke={stroke} strokeWidth={0.8} />
      <polygon points={right} fill={rightFill} stroke={stroke} strokeWidth={0.8} />
    </g>
  );
}

export default function CubeCountingQuestion({ data, options, selectedAnswer, onSelect }) {
  const { heights, cols, rows } = data;
  const letters = ['A', 'B', 'C', 'D'];
  const cubeW = 28;
  const cubeH = cubeW * 0.6;

  // Calculate SVG dimensions
  const maxHeight = Math.max(...heights.flat());
  const svgW = (cols + rows) * cubeW / 2 + cubeW;
  const svgH = (cols + rows) * cubeH / 2 + maxHeight * cubeH + cubeH * 2;

  // Origin point (bottom-left of the grid, in iso space)
  const ox = rows * cubeW / 2 + cubeW / 2;
  const oy = svgH - cubeH;

  // Convert grid (row, col, layer) to isometric pixel position
  const toIso = (r, c, layer) => {
    const x = ox + (c - r) * cubeW / 2;
    const y = oy - (c + r) * cubeH / 2 - layer * cubeH;
    return { x, y };
  };

  // Render cubes back-to-front for proper occlusion
  const cubes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = heights[r][c];
      for (let l = 0; l < h; l++) {
        const { x, y } = toIso(r, c, l);
        cubes.push(
          <IsoCube key={`${r}-${c}-${l}`} x={x} y={y} size={cubeW} shade={l} />
        );
      }
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {cubes}
        </svg>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className={`px-6 py-2 rounded-lg font-mono text-lg tracking-wider cursor-pointer border transition-all
                ${isS ? 'bg-accent/20 border-accent text-accent' : 'bg-bone/5 border-bone/10 text-bone/50 hover:border-bone/30'}`}>
              <span className="text-xs mr-2 opacity-50">{letters[i]}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
