export function SvgDefs() {
  return (
    <defs>
      <pattern id="pat-hatched" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(245,240,232,0.55)" strokeWidth="1.5" />
      </pattern>
      <pattern id="pat-dotted" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1" fill="rgba(245,240,232,0.5)" />
      </pattern>
    </defs>
  );
}

function getFill(fillType) {
  if (fillType === 'solid') return 'rgba(245,240,232,0.4)';
  if (fillType === 'hatched') return 'url(#pat-hatched)';
  if (fillType === 'dotted') return 'url(#pat-dotted)';
  return 'none';
}

function sizeScale(sizeStr) {
  if (sizeStr === 'small') return 0.6;
  if (sizeStr === 'large') return 1.15;
  return 0.85;
}

function getStrokeDasharray(borderType) {
  if (borderType === 'dashed') return '4 3';
  if (borderType === 'dotted') return '1.5 2';
  if (borderType === 'double') return '6 2 2 2';
  return 'none';
}

const SHAPES = {
  circle: (cx, cy, s, fill, stroke, sd) => <circle cx={cx} cy={cy} r={s*0.34} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />,
  square: (cx, cy, s, fill, stroke, sd) => <rect x={cx-s*0.28} y={cy-s*0.28} width={s*0.56} height={s*0.56} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />,
  triangle: (cx, cy, s, fill, stroke, sd) => {
    const h=s*0.34;
    return <polygon points={`${cx},${cy-h} ${cx-h},${cy+h*0.7} ${cx+h},${cy+h*0.7}`} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />;
  },
  diamond: (cx, cy, s, fill, stroke, sd) => {
    const h=s*0.34;
    return <polygon points={`${cx},${cy-h} ${cx+h*0.7},${cy} ${cx},${cy+h} ${cx-h*0.7},${cy}`} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />;
  },
  pentagon: (cx, cy, s, fill, stroke, sd) => {
    const r=s*0.3;
    const pts=Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;}).join(' ');
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />;
  },
  hexagon: (cx, cy, s, fill, stroke, sd) => {
    const r=s*0.3;
    const pts=Array.from({length:6},(_,i)=>{const a=(i*60-90)*Math.PI/180;return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;}).join(' ');
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />;
  },
  star: (cx, cy, s, fill, stroke, sd) => {
    const o=s*0.34,inn=s*0.14;
    const pts=Array.from({length:10},(_,i)=>{const a=(i*36-90)*Math.PI/180;const r=i%2===0?o:inn;return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;}).join(' ');
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} />;
  },
  cross: (cx, cy, s, fill, stroke, sd) => {
    const w=s*0.16,h=s*0.34;
    return <g><rect x={cx-w} y={cy-h} width={w*2} height={h*2} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} /><rect x={cx-h} y={cy-w} width={h*2} height={w*2} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={sd} /></g>;
  },
};

export function renderShape(name, cx, cy, baseSize, fillType='empty', strokeColor='rgba(245,240,232,0.65)', shapeSize='medium', borderType='solid') {
  const scale = sizeScale(shapeSize);
  const size = baseSize * scale;
  const fill = getFill(fillType);
  const sd = getStrokeDasharray(borderType);
  const ShapeFn = SHAPES[name];
  if (!ShapeFn) return null;
  return ShapeFn(cx, cy, size, fill, strokeColor, sd);
}

export function ShapeCell({ shape, rotation=0, fill='empty', size:cellSize=64, highlight=false, shapeSize='medium', dots, border='solid', innerShape, innerFill, dotPos, arrowDir }) {
  const stroke = 'rgba(245,240,232,0.65)';
  const cx = cellSize/2, cy = cellSize/2;

  // Dot position offsets
  const dotOffsets = {
    tl: [-cellSize*0.25, -cellSize*0.25],
    tr: [cellSize*0.25, -cellSize*0.25],
    bl: [-cellSize*0.25, cellSize*0.25],
    br: [cellSize*0.25, cellSize*0.25],
    center: [0, 0],
  };

  return (
    <svg width={cellSize} height={cellSize} viewBox={`0 0 ${cellSize} ${cellSize}`}>
      <SvgDefs />
      <rect width={cellSize} height={cellSize} rx={5}
        fill={highlight?'rgba(201,168,76,0.1)':'rgba(245,240,232,0.03)'}
        stroke={highlight?'rgba(201,168,76,0.5)':'rgba(245,240,232,0.1)'}
        strokeWidth={1} />
      <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
        {renderShape(shape, cx, cy, cellSize, fill, stroke, shapeSize, border)}
      </g>
      {innerShape && (
        <g>
          {renderShape(innerShape, cx, cy, cellSize * 0.45, innerFill || 'solid', stroke, 'medium')}
        </g>
      )}
      {dotPos && dotOffsets[dotPos] && (
        <circle cx={cx + dotOffsets[dotPos][0]} cy={cy + dotOffsets[dotPos][1]} r={3} fill="rgba(245,240,232,0.7)" />
      )}
      {arrowDir !== undefined && (
        <g transform={`rotate(${arrowDir}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy + cellSize*0.15} x2={cx} y2={cy - cellSize*0.25} stroke="rgba(245,240,232,0.5)" strokeWidth={1.5} />
          <polygon points={`${cx},${cy - cellSize*0.3} ${cx-4},${cy - cellSize*0.2} ${cx+4},${cy - cellSize*0.2}`} fill="rgba(245,240,232,0.5)" />
        </g>
      )}
      {dots !== undefined && dots > 0 && (
        <g>
          {Array.from({length: dots}, (_, di) => {
            const angle = (di * 360 / dots - 90) * Math.PI / 180;
            const dr = cellSize * 0.4;
            return <circle key={di} cx={cx + dr*Math.cos(angle)} cy={cy + dr*Math.sin(angle)} r={2.5} fill="rgba(245,240,232,0.6)" />;
          })}
        </g>
      )}
    </svg>
  );
}

export default SHAPES;
