const MARK_RENDERERS = {
  empty: () => null,
  dot: (cx, cy, s) => <circle cx={cx} cy={cy} r={s * 0.12} fill="rgba(245,240,232,0.6)" />,
  cross: (cx, cy, s) => (
    <g>
      <line x1={cx - s * 0.2} y1={cy - s * 0.2} x2={cx + s * 0.2} y2={cy + s * 0.2} stroke="rgba(245,240,232,0.6)" strokeWidth={1.5} />
      <line x1={cx + s * 0.2} y1={cy - s * 0.2} x2={cx - s * 0.2} y2={cy + s * 0.2} stroke="rgba(245,240,232,0.6)" strokeWidth={1.5} />
    </g>
  ),
  'line-h': (cx, cy, s) => <line x1={cx - s * 0.25} y1={cy} x2={cx + s * 0.25} y2={cy} stroke="rgba(245,240,232,0.6)" strokeWidth={2} />,
  'line-v': (cx, cy, s) => <line x1={cx} y1={cy - s * 0.25} x2={cx} y2={cy + s * 0.25} stroke="rgba(245,240,232,0.6)" strokeWidth={2} />,
  diag: (cx, cy, s) => <line x1={cx - s * 0.25} y1={cy - s * 0.25} x2={cx + s * 0.25} y2={cy + s * 0.25} stroke="rgba(245,240,232,0.6)" strokeWidth={1.5} />,
  square: (cx, cy, s) => <rect x={cx - s * 0.15} y={cy - s * 0.15} width={s * 0.3} height={s * 0.3} fill="rgba(245,240,232,0.5)" />,
  circle: (cx, cy, s) => <circle cx={cx} cy={cy} r={s * 0.15} fill="none" stroke="rgba(245,240,232,0.6)" strokeWidth={1.5} />,
  triangle: (cx, cy, s) => <polygon points={`${cx},${cy - s * 0.18} ${cx - s * 0.16},${cy + s * 0.12} ${cx + s * 0.16},${cy + s * 0.12}`} fill="rgba(245,240,232,0.5)" />,
  hatched: (cx, cy, s) => (
    <g>
      {[-0.15, 0, 0.15].map((off, i) => (
        <line key={i} x1={cx - s * 0.2} y1={cy + s * off} x2={cx + s * 0.2} y2={cy + s * off} stroke="rgba(245,240,232,0.4)" strokeWidth={1} />
      ))}
    </g>
  ),
};

function FaceSquare({ mark, x, y, size }) {
  const stroke = 'rgba(245,240,232,0.4)';
  const Renderer = MARK_RENDERERS[mark];
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="rgba(245,240,232,0.05)" stroke={stroke} strokeWidth={1} />
      {Renderer && Renderer(x + size / 2, y + size / 2, size)}
    </g>
  );
}

function CubeNet({ faces, size = 180 }) {
  const fs = size * 0.22; // face size
  const ox = size * 0.18, oy = size * 0.05; // offset

  // Cross layout:
  //        [0] top
  // [4] [1] [2] [3]
  //        [5] bottom
  const positions = [
    [ox + fs, oy],                    // 0: top
    [ox, oy + fs],                    // 4: left
    [ox + fs, oy + fs],              // 1: front
    [ox + fs * 2, oy + fs],          // 2: right
    [ox + fs * 3, oy + fs],          // 3: back
    [ox + fs, oy + fs * 2],          // 5: bottom
  ];
  const faceOrder = [0, 4, 1, 2, 3, 5];

  return (
    <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.8}`}>
      {faceOrder.map((fi, i) => (
        <FaceSquare key={i} mark={faces[fi]} x={positions[i][0]} y={positions[i][1]} size={fs} />
      ))}
    </svg>
  );
}

function CubeIsometric({ top, front, right, size = 64 }) {
  const stroke = 'rgba(245,240,232,0.4)';
  const cx = size / 2, cy = size * 0.35;
  const s = size * 0.28;

  // Simple isometric cube - 3 visible faces
  // Top face (parallelogram)
  const topPath = `M${cx},${cy - s * 0.6} L${cx + s},${cy} L${cx},${cy + s * 0.6} L${cx - s},${cy} Z`;
  // Front face
  const frontPath = `M${cx - s},${cy} L${cx},${cy + s * 0.6} L${cx},${cy + s * 1.6} L${cx - s},${cy + s} Z`;
  // Right face
  const rightPath = `M${cx},${cy + s * 0.6} L${cx + s},${cy} L${cx + s},${cy + s} L${cx},${cy + s * 1.6} Z`;

  const renderMark = (mark, pathCx, pathCy, faceSize) => {
    const Renderer = MARK_RENDERERS[mark];
    if (!Renderer) return null;
    return Renderer(pathCx, pathCy, faceSize);
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={topPath} fill="rgba(245,240,232,0.1)" stroke={stroke} strokeWidth={1} />
      <path d={frontPath} fill="rgba(245,240,232,0.05)" stroke={stroke} strokeWidth={1} />
      <path d={rightPath} fill="rgba(245,240,232,0.02)" stroke={stroke} strokeWidth={1} />
      {renderMark(top, cx, cy, s * 0.8)}
      {renderMark(front, cx - s * 0.5, cy + s * 0.8, s * 0.7)}
      {renderMark(right, cx + s * 0.5, cy + s * 0.8, s * 0.7)}
    </svg>
  );
}

export default function CubeNetQuestion({ data, options, selectedAnswer, onSelect }) {
  const { faces } = data;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="flex justify-center mb-8">
        <CubeNet faces={faces} size={200} />
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          const vf = typeof opt === 'string' ? JSON.parse(opt) : opt;
          return (
            <button key={i} onClick={() => onSelect(i)} className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`rounded-lg p-1 ${isS ? 'ring-1 ring-accent/50 bg-accent/10' : ''}`}>
                <CubeIsometric top={vf.top} front={vf.front} right={vf.right} size={72} />
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
