// Visual question generators - UVE official exam level
// Rewritten from scratch to match real UVE difficulty

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN(arr, n, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function safeDistractors(ansStr, count, gen, rng) {
  const d = [];
  const used = new Set([ansStr]);
  let s = 0;
  while (d.length < count && s < 200) {
    s++;
    const v = gen(rng);
    const vs = typeof v === 'string' ? v : JSON.stringify(v);
    if (!used.has(vs)) { used.add(vs); d.push(vs); }
  }
  return d;
}

const SHAPES = ['circle', 'triangle', 'square', 'diamond', 'star', 'pentagon', 'hexagon', 'cross'];
const FILLS = ['empty', 'solid', 'hatched', 'dotted'];
const SIZES = ['small', 'medium', 'large'];
const BORDERS = ['solid', 'dashed', 'dotted', 'double'];

// ============================================================
// 1. DOMINO SEQUENCES
// ============================================================
function generateDominoQuestion(rng) {
  const patterns = [
    // [description, topFn, botFn]
    (st, sb) => ({ seq: (i) => [(st+i)%7, (sb+i)%7], exp: 'Ambas +1.' }),
    (st, sb) => ({ seq: (i) => [(st+i*2)%7, Math.max(0,sb-i)], exp: 'Superior +2, inferior -1.' }),
    (st, sb) => { const sum=st+sb; return { seq: (i) => { const t=(st+i)%7; return [t, Math.max(0,Math.min(6,sum-t))]; }, exp: `Suma constante=${sum}.` }; },
    (st, sb) => ({ seq: (i) => [(st+i*2)%7, (sb+i*2)%7], exp: 'Ambas +2.' }),
    (st, sb) => ({ seq: (i) => [(st+i)%7, 6-((st+i)%7)], exp: 'Inferior=complemento a 6.' }),
    (st, sb) => ({ seq: (i) => [(st+i)%7, (sb+i*3)%7], exp: 'Superior +1, inferior +3.' }),
    (st, sb) => ({ seq: (i) => [i%2===0?st:(st+3)%7, (sb+i)%7], exp: `Superior alterna ${st}/${(st+3)%7}, inferior +1.` }),
    (st, sb) => ({ seq: (i) => [Math.max(0,st-i), (sb+i*2)%7], exp: 'Superior -1, inferior +2.' }),
    (st, sb) => ({ seq: (i) => [(st+i)%7, (sb+i)%7 === 0 ? 6 : (sb+i)%7], exp: 'Ambas +1, inferior salta el 0.' }),
    (st, sb) => ({ seq: (i) => [(st+Math.floor(i/2))%7, (sb+i)%7], exp: 'Superior +1 cada 2, inferior +1.' }),
  ];
  const st = Math.floor(rng()*5)+1, sb = Math.floor(rng()*5)+1;
  const pat = pick(patterns, rng)(st, sb);
  const seq = Array.from({length:5}, (_,i) => pat.seq(i));
  const ans = pat.seq(5);

  const ansStr = ans.join(',');
  const dist = safeDistractors(ansStr, 3, r => {
    const a0 = Math.min(6,Math.max(0,ans[0]+Math.floor(r()*5)-2));
    const a1 = Math.min(6,Math.max(0,ans[1]+Math.floor(r()*5)-2));
    return `${a0},${a1}`;
  }, rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `dom-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','dominos'],
    question: 'Que ficha de domino completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: pat.exp,
    visualType: 'dominos', visualData: { sequence: seq },
  };
}

// ============================================================
// 2. 3x3 MATRICES - UVE LEVEL
// Each cell has MULTIPLE properties varying by DIFFERENT rules per row/col
// ============================================================
function generateMatrixQuestion(rng) {
  const pat = Math.floor(rng() * 10);
  let grid, answer, exp;

  if (pat === 0) {
    // Row=shape, Col=fill, Diagonal=size (UVE q20 style)
    const rs = pickN(SHAPES, 3, rng);
    const cf = pickN(FILLS, 3, rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:rs[r], fill:cf[c], size:SIZES[c], border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Fila=forma, columna=relleno, tamano crece por columna.';
  } else if (pat === 1) {
    // Row=fill, Col=shape, Size changes diagonally (UVE q22 stars style)
    const cs = pickN(SHAPES, 3, rng);
    const rf = pickN(FILLS, 3, rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:cs[c], fill:rf[r], size:SIZES[(r+c)%3], border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Fila=relleno, columna=forma, tamano rota diagonalmente.';
  } else if (pat === 2) {
    // Latin square shapes + fill progresses + rotation (3 rules)
    const s3 = pickN(SHAPES, 3, rng);
    const f3 = pickN(FILLS, 3, rng);
    const latin = [[0,1,2],[1,2,0],[2,0,1]];
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:s3[latin[r][c]], fill:f3[c], size:SIZES[r], border:'solid', rotation:r*30});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Cuadrado latino de formas + relleno por columna + tamano por fila + rotacion.';
  } else if (pat === 3) {
    // Same shape, 3 properties change: fill by row, size by col, border by diagonal
    const shape = pick(SHAPES, rng);
    const cf = pickN(FILLS, 3, rng);
    const cb = pickN(BORDERS, 3, rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape, fill:cf[r], size:SIZES[c], border:cb[(r+c)%3]});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Misma forma. Relleno por fila, tamano por columna, borde rota diagonalmente.';
  } else if (pat === 4) {
    // Dots inside shapes: shape by row, dots count by col, fill by diagonal
    const rs = pickN(SHAPES.slice(0,4), 3, rng);
    const dots = [1,2,3];
    const f3 = ['empty','hatched','solid'];
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:rs[r], fill:f3[(r+c)%3], size:'medium', dots:dots[c], border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Forma por fila, puntos por columna, relleno rota diagonalmente.';
  } else if (pat === 5) {
    // Half-fill shapes (UVE q18 ellipses style): shape+halfFill+orientation
    const shape = pick(['circle','square','diamond'], rng);
    const halfFills = ['left','right','top','bottom','full','empty'];
    const hf = pickN(halfFills, 3, rng);
    const rots = [0, 45, 90];
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape, fill:'half', halfFill:hf[c], size:SIZES[r], rotation:rots[c], border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Mitad rellena cambia por columna, tamano por fila, rotacion por columna.';
  } else if (pat === 6) {
    // Arrow matrix (UVE q41 style): direction by row, fill by col, style by row
    const dirs = pickN([0, 90, 180, 270], 3, rng);
    const f3 = pickN(FILLS, 3, rng);
    const shapes = pickN(['triangle','diamond','pentagon'], 3, rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:shapes[r], fill:f3[c], size:'medium', rotation:dirs[r], border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Forma+direccion por fila, relleno por columna.';
  } else if (pat === 7) {
    // Complex: shape changes row, fill changes col, size changes row, dots change col
    const rs = pickN(SHAPES, 3, rng);
    const cf = pickN(FILLS, 3, rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:rs[r], fill:cf[c], size:SIZES[r], dots:c+1, border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Forma+tamano por fila, relleno+puntos por columna.';
  } else if (pat === 8) {
    // Border style matrix: shape by col, border by row, fill progresses
    const cs = pickN(SHAPES, 3, rng);
    const rb = pickN(BORDERS, 3, rng);
    const fills = ['empty','hatched','solid'];
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape:cs[c], fill:fills[(r+c)%3], size:'medium', border:rb[r]});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = 'Forma por columna, borde por fila, relleno rota diagonalmente.';
  } else {
    // Rotation matrix: same shape, rotation increments per col, fill by row, size by diagonal
    const shape = pick(SHAPES, rng);
    const rf = pickN(FILLS, 3, rng);
    const step = pick([30,45,60,90], rng);
    grid = []; for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      grid.push({shape, fill:rf[r], size:SIZES[(r+c)%3], rotation:c*step, border:'solid'});
    answer = grid[8]; grid = grid.slice(0,8);
    exp = `Rotacion +${step}° por columna, relleno por fila, tamano rota diagonal.`;
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => {
    const d = JSON.parse(ansStr);
    // Mutate 1-2 properties slightly
    const mutations = Math.floor(r()*2)+1;
    for (let m=0;m<mutations;m++) {
      const prop = Math.floor(r()*5);
      if (prop===0) d.shape = pick(SHAPES, r);
      else if (prop===1) d.fill = pick(FILLS, r);
      else if (prop===2) d.size = pick(SIZES, r);
      else if (prop===3 && d.rotation!==undefined) d.rotation = (d.rotation + pick([30,45,60,90,180],r)) % 360;
      else if (prop===4 && d.dots!==undefined) d.dots = 1+Math.floor(r()*3);
      else if (prop===4) d.border = pick(BORDERS, r);
    }
    return JSON.stringify(d);
  }, rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `mat-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','matrices'],
    question: 'Que figura completa la matriz?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'matriz', visualData: { grid },
  };
}

// ============================================================
// 3. DIVIDED CIRCLES (UVE35 q30-36)
// ============================================================
function generateDividedCircleQuestion(rng) {
  const CFILLS = ['empty','solid','black','gray','hatched','dotted'];
  const numSectors = pick([2, 3, 4], rng);
  const baseFills = pickN(CFILLS, numSectors, rng);
  // Ensure at least 2 different fills for visual distinction
  if (new Set(baseFills).size < 2) baseFills[0] = pick(CFILLS.filter(f => f !== baseFills[1]), rng);
  const steps = 3 + Math.floor(rng() * 3);
  const rotateBy = pick([1, 2], rng);
  const clockwise = rng() > 0.5;
  const showArrow = rng() > 0.2;
  const dir = clockwise ? 1 : -1;

  const sequence = [];
  for (let s = 0; s < steps; s++) {
    sequence.push(Array.from({length:numSectors}, (_,i) =>
      baseFills[((i + s*rotateBy*dir) % numSectors + numSectors) % numSectors]));
  }
  const answerFills = Array.from({length:numSectors}, (_,i) =>
    baseFills[((i + steps*rotateBy*dir) % numSectors + numSectors) % numSectors]);

  const ansStr = JSON.stringify(answerFills);
  const dist = safeDistractors(ansStr, 3, r => {
    const off = 1+Math.floor(r()*3);
    return JSON.stringify(Array.from({length:numSectors}, (_,i) =>
      baseFills[((i+(steps+off)*rotateBy*dir)%numSectors+numSectors)%numSectors]));
  }, rng);
  let fillSafety = 0;
  while (dist.length<3 && fillSafety < 100) {
    fillSafety++;
    // Try shuffling, then try swapping one fill with a different one
    const af = JSON.parse(ansStr);
    const swapIdx = Math.floor(rng() * numSectors);
    const altFill = pick(CFILLS.filter(f => f !== af[swapIdx]), rng);
    af[swapIdx] = altFill;
    const d = JSON.stringify(af);
    if(d!==ansStr&&!dist.includes(d)) dist.push(d);
  }

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `dcr-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','circulos-divididos'],
    question: 'Que circulo completa la serie?',
    options: opts, answer: opts.indexOf(ansStr),
    explanation: `Sectores rotan ${rotateBy} posicion(es) en sentido ${clockwise?'horario':'antihorario'}.`,
    visualType: 'circulos-divididos', visualData: { sequence, sectors: numSectors, showArrow, clockwise },
  };
}

// ============================================================
// 4. PINWHEEL SECTORS (UVE25 q1-5)
// ============================================================
function generatePinwheelQuestion(rng) {
  const sectorCount = 8;
  const fillTypes = ['empty', 'solid', 'hatched'];
  const base = Array.from({length:sectorCount}, () => pick(fillTypes, rng));
  // Ensure visual variety
  if (base.filter(f=>f==='solid').length<2) { base[0]='solid'; base[3]='solid'; }
  const rotateBy = pick([1, 2, 3], rng);
  const steps = 4 + Math.floor(rng() * 3);

  const sequence = [];
  for (let s = 0; s < steps; s++) {
    sequence.push(Array.from({length:sectorCount}, (_,i) => base[(i + s*rotateBy) % sectorCount]));
  }
  const answerSectors = Array.from({length:sectorCount}, (_,i) => base[(i + steps*rotateBy) % sectorCount]);

  const ansStr = JSON.stringify(answerSectors);
  const dist = safeDistractors(ansStr, 3, r => {
    const off = 1+Math.floor(r()*3);
    return JSON.stringify(Array.from({length:sectorCount}, (_,i) => base[(i+(steps+off)*rotateBy)%sectorCount]));
  }, rng);
  { let ps=0; while (dist.length<3 && ps<100) { ps++; const d=JSON.stringify(Array.from({length:sectorCount}, () => pick(fillTypes,rng))); if(d!==ansStr&&!dist.includes(d)) dist.push(d); } }

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `pin-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','pinwheel'],
    question: 'Que figura completa la serie?',
    options: opts, answer: opts.indexOf(ansStr),
    explanation: `Sectores rotan ${rotateBy} posicion(es) en cada paso.`,
    visualType: 'pinwheel', visualData: { sequence },
  };
}

// ============================================================
// 5. COMPLEX VISUAL SERIES (UVE q16-25 style)
// Each cell has MULTIPLE elements changing independently
// ============================================================
function generateComplexSeriesQuestion(rng) {
  const pat = Math.floor(rng() * 8);
  let sequence, answer, exp;

  if (pat === 0) {
    // Shape + fill progression + size oscillation
    const shapes = pickN(SHAPES, 3, rng);
    const fills = ['empty','dotted','hatched','solid'];
    sequence = Array.from({length:5}, (_,i) => ({
      shape: shapes[i%3], fill: fills[i%4], size: SIZES[i%3], rotation: i*45
    }));
    answer = {shape:shapes[5%3], fill:fills[5%4], size:SIZES[5%3], rotation:5*45};
    exp = 'Forma cicla cada 3, relleno cada 4, tamano cada 3, rotacion +45°.';
  } else if (pat === 1) {
    // Two shapes alternating + properties changing
    const s1 = pick(SHAPES, rng), s2 = pick(SHAPES.filter(s=>s!==s1), rng);
    const fills = pickN(FILLS, 3, rng);
    sequence = Array.from({length:6}, (_,i) => ({
      shape: i%2===0?s1:s2, fill: fills[Math.floor(i/2)%3],
      size: SIZES[Math.floor(i/2)%3], rotation: (i%2)*90
    }));
    answer = {shape:6%2===0?s1:s2, fill:fills[Math.floor(6/2)%3], size:SIZES[Math.floor(6/2)%3], rotation:(6%2)*90};
    exp = `Alternan ${s1}/${s2}, relleno y tamano cambian cada par.`;
  } else if (pat === 2) {
    // Fill progression: empty -> dotted -> hatched -> solid -> empty (full cycle)
    const shape = pick(SHAPES, rng);
    const fseq = ['empty','dotted','hatched','solid'];
    const step = pick([30,45,60], rng);
    sequence = Array.from({length:5}, (_,i) => ({
      shape, fill: fseq[i%4], size: SIZES[Math.min(2,Math.floor(i*3/5))], rotation: i*step
    }));
    answer = {shape, fill:fseq[5%4], size:SIZES[Math.min(2,Math.floor(5*3/5))], rotation:5*step};
    exp = `Relleno progresa ciclicamente, tamano crece, rotacion +${step}°.`;
  } else if (pat === 3) {
    // Growing sides: triangle->square->pentagon->hexagon + fill/size change
    const prog = ['triangle','square','pentagon','hexagon','star','circle'];
    const fills = ['empty','hatched','solid'];
    sequence = Array.from({length:5}, (_,i) => ({
      shape: prog[i], fill: fills[i%3], size: SIZES[i%3]
    }));
    answer = {shape:prog[5], fill:fills[5%3], size:SIZES[5%3]};
    exp = 'Lados crecientes, relleno y tamano rotan cada 3.';
  } else if (pat === 4) {
    // Multi-element cell: main shape + small dot position + arrow direction
    const shape = pick(SHAPES.slice(0,4), rng);
    const dotPositions = ['tl','tr','bl','br','center'];
    const arrowDirs = [0, 90, 180, 270];
    sequence = Array.from({length:5}, (_,i) => ({
      shape, fill: FILLS[i%4], size: 'medium',
      dotPos: dotPositions[i%5], arrowDir: arrowDirs[i%4]
    }));
    answer = {shape, fill:FILLS[5%4], size:'medium', dotPos:dotPositions[5%5], arrowDir:arrowDirs[5%4]};
    exp = 'Relleno cicla cada 4, punto rota posiciones, flecha gira 90°.';
  } else if (pat === 5) {
    // Shape + inner shape + fill swap pattern
    const outer = pick(SHAPES.slice(0,4), rng);
    const inner = pick(SHAPES.slice(0,4).filter(s=>s!==outer), rng);
    const ofills = ['empty','solid','hatched'];
    const ifills = ['solid','empty','hatched'];
    sequence = Array.from({length:5}, (_,i) => ({
      shape: outer, fill: ofills[i%3], size: 'large',
      innerShape: inner, innerFill: ifills[i%3], innerSize: 'small'
    }));
    answer = {shape:outer, fill:ofills[5%3], size:'large', innerShape:inner, innerFill:ifills[5%3], innerSize:'small'};
    exp = 'Rellenos exterior e interior se alternan inversamente.';
  } else if (pat === 6) {
    // Rotation + fill + border style change
    const shape = pick(SHAPES, rng);
    const step = pick([30,45,60,90], rng);
    sequence = Array.from({length:5}, (_,i) => ({
      shape, fill: FILLS[i%4], size: 'medium',
      rotation: i*step, border: BORDERS[i%4]
    }));
    answer = {shape, fill:FILLS[5%4], size:'medium', rotation:5*step, border:BORDERS[5%4]};
    exp = `Rotacion +${step}°, relleno y borde progresan ciclicamente.`;
  } else {
    // Alternating shapes with size growing + fill changing
    const s1 = pick(SHAPES, rng), s2 = pick(SHAPES.filter(s=>s!==s1), rng);
    const s3 = pick(SHAPES.filter(s=>s!==s1&&s!==s2), rng);
    sequence = Array.from({length:6}, (_,i) => ({
      shape: [s1,s2,s3][i%3], fill: FILLS[Math.floor(i/3)],
      size: SIZES[i%3], rotation: Math.floor(i/2)*60
    }));
    answer = {shape:[s1,s2,s3][6%3], fill:FILLS[Math.floor(6/3)%4], size:SIZES[6%3], rotation:Math.floor(6/2)*60};
    exp = 'Tres formas en ciclo, relleno cambia cada 3, tamano rota.';
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => {
    const d = JSON.parse(ansStr);
    const prop = Math.floor(r()*4);
    if (prop===0) d.shape = pick(SHAPES, r);
    else if (prop===1) d.fill = pick(FILLS, r);
    else if (prop===2) d.size = pick(SIZES, r);
    else if (d.rotation !== undefined) d.rotation = (d.rotation + pick([45,90,135,180],r)) % 360;
    else d.fill = pick(FILLS, r);
    return JSON.stringify(d);
  }, rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `csr-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','series-figuras'],
    question: 'Que figura completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'series-figuras', visualData: { sequence },
  };
}

// ============================================================
// 6. SHAPE ALGEBRA (UVE q28-37)
// Systems with negative numbers, multiplication, division
// ============================================================
function generateShapeAlgebraQuestion(rng) {
  const pat = Math.floor(rng() * 10);
  const shapes = pickN(SHAPES.slice(0, 6), 3, rng);
  const [s1, s2, s3] = shapes;
  let equations, askIdx, exp;

  const el = (type, val) => ({ type, ...(type==='shape'?{shape:val}:type==='operator'?{value:val}:type==='number'?{value:val}:{}) });

  if (pat === 0) {
    // ■+●+▲=X, ■+●=Y => ▲=?
    const a=1+Math.floor(rng()*4), b=1+Math.floor(rng()*4), c=1+Math.floor(rng()*5);
    equations = [
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('operator','+'),el('shape',s3),el('equals'),el('number',a+b+c)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',a+b)]},
      {elements:[el('shape',s3),el('equals'),el('unknown')]},
    ];
    askIdx=c; exp=`${s1}+${s2}=${a+b}, total=${a+b+c}, luego ${s3}=${c}.`;
  } else if (pat === 1) {
    // ■×●=X, ■+●=Y => ■=?
    const a=2+Math.floor(rng()*4), b=1+Math.floor(rng()*4);
    equations = [
      {elements:[el('shape',s1),el('operator','\u00D7'),el('shape',s2),el('equals'),el('number',a*b)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',a+b)]},
      {elements:[el('shape',s1),el('equals'),el('unknown')]},
    ];
    askIdx=a; exp=`${s1}\u00D7${s2}=${a*b}, ${s1}+${s2}=${a+b}. ${s1}=${a}.`;
  } else if (pat === 2) {
    // ▲+●=-2, ▲+■=-2, ■+●=-2 => ■?
    const a=-2+Math.floor(rng()*3), b=-2+Math.floor(rng()*3), c=-2+Math.floor(rng()*3);
    // Solve: a+b=S1, a+c=S2, b+c=S3 => a=(S1+S2-S3)/2
    const S1=a+b, S2=a+c, S3=b+c;
    equations = [
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',S1)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s3),el('equals'),el('number',S2)]},
      {elements:[el('shape',s2),el('operator','+'),el('shape',s3),el('equals'),el('number',S3)]},
      {elements:[el('shape',s3),el('equals'),el('unknown')]},
    ];
    askIdx=c; exp=`Sumando las 3: 2(${s1}+${s2}+${s3})=${S1+S2+S3}. ${s3}=${c}.`;
  } else if (pat === 3) {
    // ■-▲=-2, ■=▲-● => ●?
    const a=3+Math.floor(rng()*4), b=1+Math.floor(rng()*3), c=a-b+Math.floor(rng()*3);
    const sq=a, tri=b, ci=sq-tri;
    equations = [
      {elements:[el('shape',s1),el('operator','-'),el('shape',s2),el('equals'),el('number',sq-tri)]},
      {elements:[el('shape',s1),el('equals'),el('shape',s2),el('operator','-'),el('shape',s3)]},
      {elements:[el('shape',s3),el('equals'),el('unknown')]},
    ];
    askIdx=tri-(sq-tri); // s1=s2-s3 and s1-s2=diff => s3=s2-s1=-(diff)
    askIdx = -(sq-tri);
    exp=`${s1}-${s2}=${sq-tri}, ${s1}=${s2}-${s3}, luego ${s3}=${askIdx}.`;
  } else if (pat === 4) {
    // 2■+●=X, ●+2▲=Y, ■=Z => ▲?
    const a=1+Math.floor(rng()*3), b=2+Math.floor(rng()*4), c=1+Math.floor(rng()*3);
    equations = [
      {elements:[el('number',2),el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',2*a+b)]},
      {elements:[el('shape',s2),el('operator','+'),el('number',2),el('shape',s3),el('equals'),el('number',b+2*c)]},
      {elements:[el('shape',s1),el('equals'),el('number',a)]},
      {elements:[el('shape',s3),el('equals'),el('unknown')]},
    ];
    askIdx=c; exp=`${s1}=${a}, 2(${a})+${s2}=${2*a+b} => ${s2}=${b}. ${b}+2${s3}=${b+2*c} => ${s3}=${c}.`;
  } else if (pat === 5) {
    // ■+●+▲+◆=X, ■+●=-◆+Y, ●=Z => ▲?
    const a=1+Math.floor(rng()*3), b=1+Math.floor(rng()*3), c=2+Math.floor(rng()*3);
    equations = [
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',a+b)]},
      {elements:[el('shape',s1),el('equals'),el('number',a)]},
      {elements:[el('shape',s2),el('operator','+'),el('shape',s3),el('equals'),el('number',b+c)]},
      {elements:[el('shape',s3),el('equals'),el('unknown')]},
    ];
    askIdx=c; exp=`${s1}=${a}, ${s2}=${b}, ${s2}+${s3}=${b+c} => ${s3}=${c}.`;
  } else if (pat === 6) {
    // ●-▲+■=-2, ●+▲=1, ●+■=1 => ●?
    const a=0, b=1, c=1; // simple solvable system
    equations = [
      {elements:[el('shape',s1),el('operator','-'),el('shape',s2),el('operator','+'),el('shape',s3),el('equals'),el('number',a-b+c)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',a+b)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s3),el('equals'),el('number',a+c)]},
      {elements:[el('shape',s1),el('equals'),el('unknown')]},
    ];
    askIdx=a; exp=`De ec.2 y ec.3: ${s2}=${b}, ${s3}=${c}. ${s1}=${a}.`;
  } else if (pat === 7) {
    // ■+■+●=X, ●+●+■=Y => ■?
    const a=1+Math.floor(rng()*4), b=1+Math.floor(rng()*4);
    equations = [
      {elements:[el('shape',s1),el('operator','+'),el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',2*a+b)]},
      {elements:[el('shape',s2),el('operator','+'),el('shape',s2),el('operator','+'),el('shape',s1),el('equals'),el('number',2*b+a)]},
      {elements:[el('shape',s1),el('equals'),el('unknown')]},
    ];
    askIdx=a; exp=`Restando: ${s1}-${s2}=${a-b}. Sumando: 3(${s1}+${s2})=${3*(a+b)}. ${s1}=${a}.`;
  } else if (pat === 8) {
    // ■-▲=X, ■+▲=Y => ■?
    const a=3+Math.floor(rng()*5), b=1+Math.floor(rng()*(a-1));
    equations = [
      {elements:[el('shape',s1),el('operator','-'),el('shape',s2),el('equals'),el('number',a-b)]},
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',a+b)]},
      {elements:[el('shape',s1),el('equals'),el('unknown')]},
    ];
    askIdx=a; exp=`Sumando: 2${s1}=${2*a} => ${s1}=${a}.`;
  } else {
    // ●/2=▲+2■, ■+▲=2, ●=-2■ => ▲?
    const sq=2, tri=0, ci=-2*sq;
    equations = [
      {elements:[el('shape',s1),el('operator','+'),el('shape',s2),el('equals'),el('number',sq+tri)]},
      {elements:[el('shape',s3),el('equals'),el('number',-2),el('shape',s1)]},
      {elements:[el('shape',s2),el('equals'),el('unknown')]},
    ];
    askIdx=tri; exp=`${s3}=-2${s1}, ${s1}+${s2}=${sq+tri} => ${s2}=${tri}.`;
  }

  const cStr = String(askIdx);
  const distSet = new Set([askIdx]);
  const dist = [];
  for (const off of [1,-1,2,-2,3,-3]) {
    const n=askIdx+off;
    if(!distSet.has(n)){distSet.add(n);dist.push(String(n));}
    if(dist.length>=3) break;
  }

  const opts = shuffle([cStr,...dist.slice(0,3)], rng);
  return {
    id: `alg-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','algebra-figuras'],
    question: 'Halla el valor de la incognita.',
    options: opts, answer: opts.indexOf(cStr), explanation: exp,
    visualType: 'algebra-figuras', visualData: { equations, askShape: s1 },
  };
}

// ============================================================
// 7. CIRCUIT DIAGRAMS (UVE26 q14-17)
// ============================================================
function generateCircuitQuestion(rng) {
  const LINES_POOL = [
    ['tl-tr'],['tl-bl'],['tr-br'],['bl-br'],
    ['tl-br'],['tr-bl'],
    ['tl-tr','bl-br'],['tl-bl','tr-br'],
    ['tl-tr','tl-bl'],['tr-br','bl-br'],
    ['tl-tr','tr-bl'],['tl-bl','bl-br'],
  ];
  const pat = Math.floor(rng()*5);
  let sequence, answer, exp;

  if (pat === 0) {
    // Corners rotate clockwise, lines fixed
    const base = Array.from({length:4}, () => Math.floor(rng()*2));
    if (base.every(c=>c===base[0])) base[0]=1-base[0]; // ensure difference
    const lines = pick(LINES_POOL, rng);
    sequence = Array.from({length:4}, (_,s) => ({
      corners: [base[s%4], base[(s+1)%4], base[(s+3)%4], base[(s+2)%4]], lines
    }));
    answer = { corners: [base[4%4], base[5%4], base[7%4], base[6%4]], lines };
    exp = 'Circulos rotan en sentido horario, lineas fijas.';
  } else if (pat === 1) {
    // Lines change each step, corners fixed
    const corners = Array.from({length:4}, () => Math.floor(rng()*2));
    const lineSeq = pickN(LINES_POOL, 5, rng);
    sequence = lineSeq.slice(0,4).map(l => ({corners:[...corners], lines:l}));
    answer = {corners:[...corners], lines:lineSeq[4]};
    exp = 'Circulos fijos, lineas cambian patron.';
  } else if (pat === 2) {
    // One corner toggles each step
    const order = [0,1,3,2]; // clockwise
    sequence = Array.from({length:4}, (_,s) => {
      const c = [0,0,0,0]; for(let j=0;j<=s;j++) c[order[j]]=1;
      return {corners:c, lines:pick(LINES_POOL,rng)};
    });
    const c=[1,1,1,1]; c[order[0]]=0;
    answer = {corners:c, lines:pick(LINES_POOL,rng)};
    exp = 'Circulos se llenan uno a uno, luego el primero se vacia.';
  } else if (pat === 3) {
    // Corners alternate pattern + lines rotate
    const lines4 = pickN(LINES_POOL, 5, rng);
    sequence = Array.from({length:4}, (_,s) => ({
      corners: [(s%2),((s+1)%2),(s%2),((s+1)%2)],
      lines: lines4[s]
    }));
    answer = {corners:[4%2,(5)%2,4%2,(5)%2], lines:lines4[4]};
    exp = 'Circulos alternan patron, lineas cambian.';
  } else {
    // All corners toggle each step + lines fixed
    const lines = pick(LINES_POOL, rng);
    const base = Array.from({length:4}, () => Math.floor(rng()*2));
    sequence = Array.from({length:4}, (_,s) => ({
      corners: base.map((c,i) => (c+s*(i<2?1:0))%2),
      lines
    }));
    answer = {corners:base.map((c,i)=>(c+4*(i<2?1:0))%2), lines};
    exp = 'Los dos circulos superiores alternan, inferiores fijos.';
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => {
    const d=JSON.parse(ansStr);
    d.corners[Math.floor(r()*4)] = d.corners[Math.floor(r()*4)]?0:1;
    if(r()>0.5) d.lines=pick(LINES_POOL,r);
    return JSON.stringify(d);
  }, rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `crc-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','circuitos'],
    question: 'Que figura completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'circuitos', visualData: { sequence },
  };
}

// ============================================================
// 8. NUMBER CARD SERIES (UVE q6-11, q35-40)
// ============================================================
function generateNumberCardQuestion(rng) {
  const pat = Math.floor(rng() * 8);
  let sequence, answer, exp;

  if (pat === 0) {
    const t0=Math.floor(rng()*5), b0=Math.floor(rng()*5);
    sequence = Array.from({length:7},(_,i) => [t0+i, b0+i*2]);
    answer = [t0+7, b0+14]; exp = 'Superior +1, inferior +2.';
  } else if (pat === 1) {
    const t0=1+Math.floor(rng()*4), b0=9-Math.floor(rng()*3);
    sequence = Array.from({length:7},(_,i) => [(t0+i*3)%10, Math.max(0,b0-i)]);
    answer = [(t0+21)%10, Math.max(0,b0-7)]; exp = 'Superior +3 mod 10, inferior -1.';
  } else if (pat === 2) {
    const sum=6+Math.floor(rng()*5), t0=Math.floor(rng()*3);
    sequence = Array.from({length:7},(_,i) => {const t=(t0+i)%10; return [t, sum-t];});
    answer = [(t0+7)%10, sum-(t0+7)%10]; exp = `Suma constante=${sum}.`;
  } else if (pat === 3) {
    // Two interleaved series
    const a=Math.floor(rng()*4)+1, b=Math.floor(rng()*4)+5;
    const sa=1+Math.floor(rng()*2), sb=1+Math.floor(rng()*2);
    sequence = Array.from({length:7},(_,i) => [
      i%2===0 ? a+Math.floor(i/2)*sa : b-Math.floor(i/2)*sb,
      9-i
    ]);
    const i=7;
    answer = [i%2===0?a+Math.floor(i/2)*sa:b-Math.floor(i/2)*sb, 9-i];
    exp = 'Dos series alternas arriba, inferior decreciente.';
  } else if (pat === 4) {
    // Bold/normal alternating with different step sizes
    const t0=2+Math.floor(rng()*3), b0=1+Math.floor(rng()*3);
    sequence = Array.from({length:7},(_,i) => [(t0+i*2)%10, (b0+i)%10]);
    answer = [(t0+14)%10, (b0+7)%10]; exp = 'Superior +2, inferior +1 (mod 10).';
  } else if (pat === 5) {
    const t0=Math.floor(rng()*5)+1, b0=Math.floor(rng()*5)+1;
    sequence = Array.from({length:7},(_,i) => [t0*((i%3)+1), b0+i]);
    answer = [t0*((7%3)+1), b0+7]; exp = `Superior multiplica ciclicamente x1,x2,x3. Inferior +1.`;
  } else if (pat === 6) {
    const t0=1, b0=8;
    sequence = Array.from({length:7},(_,i) => [t0+i, b0-i]);
    answer = [t0+7, b0-7]; exp = 'Superior +1, inferior -1.';
  } else {
    const t0=2+Math.floor(rng()*3);
    const fib = [1,1]; for(let i=2;i<9;i++) fib.push(fib[i-1]+fib[i-2]);
    sequence = Array.from({length:7},(_,i) => [fib[i]%10, (t0+i*2)%10]);
    answer = [fib[7]%10, (t0+14)%10]; exp = 'Superior: Fibonacci mod 10, inferior +2.';
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => JSON.stringify([
    answer[0]+Math.floor(r()*5)-2, answer[1]+Math.floor(r()*5)-2
  ]), rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `ncd-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','fichas-numeros'],
    question: 'Que ficha completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'fichas-numeros', visualData: { sequence },
  };
}

// ============================================================
// 9. ODD ONE OUT (subtle multi-property differences)
// ============================================================
function generateOddShapeQuestion(rng) {
  const oddIdx = Math.floor(rng()*4);
  const vt = Math.floor(rng()*6);
  let options, exp;

  if (vt === 0) {
    // Same shape+fill, one has different size
    const s=pick(SHAPES,rng), f=pick(FILLS,rng), ms=pick(SIZES,rng);
    const os=pick(SIZES.filter(x=>x!==ms),rng);
    options = Array.from({length:4},(_,i) => JSON.stringify({shape:s, fill:f, size:i===oddIdx?os:ms}));
    exp = `Tres de tamano ${ms}, una ${os}.`;
  } else if (vt === 1) {
    // Two properties differ on the odd one
    const s=pick(SHAPES,rng), f=pick(FILLS,rng);
    const os=pick(SHAPES.filter(x=>x!==s),rng), of2=pick(FILLS.filter(x=>x!==f),rng);
    options = Array.from({length:4},(_,i) => JSON.stringify({
      shape:i===oddIdx?os:s, fill:i===oddIdx?of2:f, size:'medium'
    }));
    exp = `Tres son ${s}/${f}, la diferente es ${os}/${of2}.`;
  } else if (vt === 2) {
    // Same shape, subtle rotation difference
    const s=pick(SHAPES,rng), f=pick(FILLS,rng), mr=pick([0,45,90],rng);
    const or2 = (mr+180)%360;
    options = Array.from({length:4},(_,i) => JSON.stringify({shape:s, fill:f, size:'medium', rotation:i===oddIdx?or2:mr}));
    exp = `Tres rotadas ${mr}°, una a ${or2}°.`;
  } else if (vt === 3) {
    // Different border style on odd one
    const s=pick(SHAPES,rng), f=pick(FILLS,rng), mb=pick(BORDERS,rng);
    const ob=pick(BORDERS.filter(x=>x!==mb),rng);
    options = Array.from({length:4},(_,i) => JSON.stringify({shape:s, fill:f, size:'medium', border:i===oddIdx?ob:mb}));
    exp = `Tres con borde ${mb}, una con ${ob}.`;
  } else if (vt === 4) {
    // Different dot count
    const s=pick(SHAPES,rng), f=pick(FILLS,rng), md=1+Math.floor(rng()*3);
    const od=md===3?1:md+1;
    options = Array.from({length:4},(_,i) => JSON.stringify({shape:s, fill:f, size:'medium', dots:i===oddIdx?od:md}));
    exp = `Tres con ${md} punto(s), una con ${od}.`;
  } else {
    // Shape differs
    const main=pick(SHAPES,rng), odd=pick(SHAPES.filter(x=>x!==main),rng), f=pick(FILLS,rng);
    options = Array.from({length:4},(_,i) => JSON.stringify({shape:i===oddIdx?odd:main, fill:f, size:'medium'}));
    exp = `Tres son ${main}, la diferente es ${odd}.`;
  }

  return {
    id: `odd-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','figura-sobrante'],
    question: 'Cual de estas figuras NO pertenece al grupo?',
    options, answer: oddIdx, explanation: exp,
    visualType: 'figura-sobrante', visualData: {},
  };
}

// ============================================================
// 10. SHAPE CARDS (2x2 grids with shapes)
// ============================================================
function generateShapeCardQuestion(rng) {
  const cardShapes = pickN(SHAPES.slice(0,6), 4, rng);
  const pat = Math.floor(rng()*4);
  let sequence, answer, exp;

  if (pat === 0) {
    sequence = Array.from({length:4},(_,i) => ({
      tl:{shape:cardShapes[0],count:i+1}, tr:{shape:cardShapes[1],count:2},
      bl:{shape:cardShapes[2],count:1}, br:{shape:cardShapes[3],count:i+1},
    }));
    answer = {tl:{shape:cardShapes[0],count:5},tr:{shape:cardShapes[1],count:2},bl:{shape:cardShapes[2],count:1},br:{shape:cardShapes[3],count:5}};
    exp = 'Esquinas opuestas +1, resto fijo.';
  } else if (pat === 1) {
    const s4 = pickN(SHAPES.slice(0,4), 4, rng);
    sequence = Array.from({length:4},(_,i) => ({
      tl:{shape:s4[i%4],count:1},tr:{shape:s4[(i+1)%4],count:1},
      bl:{shape:s4[(i+3)%4],count:1},br:{shape:s4[(i+2)%4],count:1},
    }));
    answer = {tl:{shape:s4[4%4],count:1},tr:{shape:s4[5%4],count:1},bl:{shape:s4[7%4],count:1},br:{shape:s4[6%4],count:1}};
    exp = 'Figuras rotan en sentido horario.';
  } else if (pat === 2) {
    sequence = Array.from({length:4},(_,i) => ({
      tl:{shape:cardShapes[0],count:(i%3)+1}, tr:{shape:cardShapes[1],count:((i+1)%3)+1},
      bl:{shape:cardShapes[2],count:((i+2)%3)+1}, br:{shape:cardShapes[3],count:2},
    }));
    answer = {tl:{shape:cardShapes[0],count:(4%3)+1},tr:{shape:cardShapes[1],count:(5%3)+1},bl:{shape:cardShapes[2],count:(6%3)+1},br:{shape:cardShapes[3],count:2}};
    exp = 'Contadores rotan ciclicamente 1-2-3, esquina inferior derecha fija.';
  } else {
    const s = pick(SHAPES.slice(0,4), rng);
    sequence = Array.from({length:4},(_,i) => ({
      tl:{shape:s,count:i+1}, tr:{shape:s,count:4-i},
      bl:{shape:s,count:(i+2)%4+1}, br:{shape:s,count:3},
    }));
    answer = {tl:{shape:s,count:5},tr:{shape:s,count:0},bl:{shape:s,count:(6)%4+1},br:{shape:s,count:3}};
    exp = 'TL+1, TR-1, BL cicla, BR fijo.';
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => {
    const m=JSON.parse(ansStr);
    const cell=pick(['tl','tr','bl','br'],r);
    m[cell].count=Math.max(0,m[cell].count+Math.floor(r()*3)-1);
    if(r()>0.6) m[cell].shape=pick(SHAPES.slice(0,4),r);
    return JSON.stringify(m);
  }, rng);

  const opts = shuffle([ansStr,...dist.slice(0,3)], rng);
  return {
    id: `scd-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','fichas-simbolos'],
    question: 'Que ficha completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'fichas-simbolos', visualData: { sequence },
  };
}

// ============================================================
// 11. GRID PATTERN (black/white cells)
// ============================================================
function generateGridPatternQuestion(rng) {
  const size = pick([3,4], rng);
  const pat = Math.floor(rng()*5);
  let grids, answer, exp;

  if (pat===0) {
    const base=Array.from({length:size*size},()=>false);
    grids=[];
    for(let step=0;step<3;step++){const g=[...base];g[step*size+Math.floor(size/2)]=true;g[step*size+(Math.floor(size/2)+1)%size]=true;grids.push(g);}
    answer=[...base];const r3=3%size;answer[r3*size+Math.floor(size/2)]=true;answer[r3*size+(Math.floor(size/2)+1)%size]=true;
    exp='Patron se desplaza una fila.';
  } else if (pat===1) {
    grids=[];for(let step=0;step<3;step++){const g=Array.from({length:size*size},()=>false);for(let i=0;i<=step&&i<size;i++) g[i*size+i]=true;grids.push(g);}
    answer=Array.from({length:size*size},()=>false);for(let i=0;i<=3&&i<size;i++) answer[i*size+i]=true;
    exp='Diagonal crece una celda.';
  } else if (pat===2) {
    grids=[];for(let step=0;step<3;step++){const g=Array.from({length:size*size},()=>false);for(let c=0;c<size;c++) g[step*size+c]=true;grids.push(g);}
    answer=Array.from({length:size*size},()=>false);for(let c=0;c<size;c++) answer[(3%size)*size+c]=true;
    exp='Fila completa se desplaza.';
  } else if (pat===3) {
    grids=[];const mid=Math.floor(size/2);
    for(let step=0;step<3;step++){const g=Array.from({length:size*size},()=>false);for(let i=0;i<=step;i++){g[i*size+mid]=true;g[(size-1-i)*size+mid]=true;}grids.push(g);}
    answer=Array.from({length:size*size},()=>false);for(let i=0;i<=3&&i<size;i++){answer[i*size+mid]=true;answer[(size-1-i)*size+mid]=true;}
    exp='Columna central se rellena simetricamente.';
  } else {
    grids=[];for(let step=0;step<3;step++){const g=Array.from({length:size*size},()=>false);for(let r=0;r<=step;r++) for(let c=0;c<=step;c++) g[r*size+c]=true;grids.push(g);}
    answer=Array.from({length:size*size},()=>false);for(let r=0;r<=3&&r<size;r++) for(let c=0;c<=3&&c<size;c++) answer[r*size+c]=true;
    exp='Cuadrado crece desde la esquina superior izquierda.';
  }

  const ansStr=JSON.stringify(answer);
  const dist=safeDistractors(ansStr,3,r=>{const d=[...answer];d[Math.floor(r()*d.length)]=!d[Math.floor(r()*d.length)];d[Math.floor(r()*d.length)]=!d[Math.floor(r()*d.length)];return JSON.stringify(d);},rng);
  const opts=shuffle([ansStr,...dist.slice(0,3)],rng);
  return {
    id:`grd-${Math.floor(rng()*1e6)}`, category:'razonamiento-abstracto',
    tags:['visual','patron-cuadricula'],
    question:'Que cuadricula completa la serie?',
    options:opts, answer:opts.indexOf(ansStr), explanation:exp,
    visualType:'patron-cuadricula', visualData:{grids,size},
  };
}

// ============================================================
// 12. OVERLAY / SUPERPOSITION
// ============================================================
function generateOverlayQuestion(rng) {
  const size=3;
  const gridA=Array.from({length:size*size},()=>rng()>0.5);
  const gridB=Array.from({length:size*size},()=>rng()>0.5);
  const useXor=rng()>0.5;
  const result=gridA.map((a,i)=>useXor?(a!==gridB[i]):(a||gridB[i]));
  const ansStr=JSON.stringify(result);
  const dist=safeDistractors(ansStr,3,r=>{const d=[...result];d[Math.floor(r()*d.length)]=!d[Math.floor(r()*d.length)];d[Math.floor(r()*d.length)]=!d[Math.floor(r()*d.length)];return JSON.stringify(d);},rng);
  const opts=shuffle([ansStr,...dist.slice(0,3)],rng);
  return {
    id:`ovl-${Math.floor(rng()*1e6)}`, category:'razonamiento-abstracto',
    tags:['visual','superposicion'],
    question:`Cual es el resultado de ${useXor?'combinar':'superponer'} las dos figuras?`,
    options:opts, answer:opts.indexOf(ansStr),
    explanation:useXor?'Donde coinciden se anulan.':'Cualquier celda oscura se mantiene.',
    visualType:'superposicion', visualData:{gridA,gridB,size},
  };
}

// ============================================================
// 13. FOLDING / SYMMETRY
// ============================================================
function generateFoldingQuestion(rng) {
  const size=4, halfCols=Math.ceil(size/2);
  const halfGrid=Array.from({length:size*halfCols},()=>rng()>0.5);
  const axis=pick(['vertical','horizontal'],rng);
  let fullGrid;
  if(axis==='vertical'){fullGrid=[];for(let r=0;r<size;r++){const row=Array.from({length:halfCols},(_,c)=>halfGrid[r*halfCols+c]);fullGrid.push(...row,...[...row].reverse());}}
  else{const top=[];for(let r=0;r<halfCols;r++) top.push(Array.from({length:size},(_,c)=>halfGrid[r*halfCols+c]||false));fullGrid=[...top,...[...top].reverse()].flat();}

  const ansStr=JSON.stringify(fullGrid);
  const dist=safeDistractors(ansStr,3,r=>{const d=[...fullGrid];for(let k=0;k<2;k++){const i=Math.floor(r()*d.length);d[i]=!d[i];}return JSON.stringify(d);},rng);
  const opts=shuffle([ansStr,...dist.slice(0,3)],rng);
  return {
    id:`fld-${Math.floor(rng()*1e6)}`, category:'razonamiento-abstracto',
    tags:['visual','simetria-plegado'],
    question:`Si se despliega por el eje ${axis==='vertical'?'vertical':'horizontal'}, cual es el resultado?`,
    options:opts, answer:opts.indexOf(ansStr),
    explanation:`La figura se refleja sobre el eje ${axis}.`,
    visualType:'simetria-plegado', visualData:{halfGrid,axis,size},
  };
}

// ============================================================
// 14. COUNTING
// ============================================================
function generateCountingQuestion(rng) {
  const target=pick(SHAPES.slice(0,6),rng);
  const others=SHAPES.filter(s=>s!==target).slice(0,4);
  const targetCount=4+Math.floor(rng()*6);
  const all=[];
  for(let i=0;i<targetCount;i++) all.push({shape:target,x:Math.floor(rng()*160)+20,y:Math.floor(rng()*120)+20,fill:pick(FILLS,rng),rotation:Math.floor(rng()*4)*45});
  for(let i=0;i<5+Math.floor(rng()*8);i++) all.push({shape:pick(others,rng),x:Math.floor(rng()*160)+20,y:Math.floor(rng()*120)+20,fill:pick(FILLS,rng),rotation:Math.floor(rng()*4)*45});
  const shuffledShapes=shuffle(all,rng);

  const cStr=String(targetCount);
  const dist=[];const distNums=new Set([targetCount]);
  for(const off of [-2,-1,1,2,3]){const n=targetCount+off;if(n>0&&!distNums.has(n)){distNums.add(n);dist.push(String(n));}if(dist.length>=3)break;}

  const opts=shuffle([cStr,...dist.slice(0,3)],rng);
  const names={circle:'circulos',square:'cuadrados',triangle:'triangulos',diamond:'rombos',pentagon:'pentagonos',hexagon:'hexagonos'};
  return {
    id:`cnt-${Math.floor(rng()*1e6)}`, category:'atencion-percepcion',
    tags:['visual','conteo'],
    question:`Cuantos ${names[target]||target} hay en la imagen?`,
    options:opts, answer:opts.indexOf(cStr),
    explanation:`Hay ${targetCount} ${names[target]||target}.`,
    visualType:'conteo', visualData:{shapes:shuffledShapes,targetShape:target},
  };
}

// ============================================================
// 15. SYMBOL FREQUENCY
// ============================================================
function generateSymbolFrequencyQuestion(rng) {
  const symbols=['\u2660','\u2665','\u2666','\u2663'];
  const targetIdx=Math.floor(rng()*4);
  const askMost=rng()>0.3;
  const counts=[6,6,6,6];
  if(askMost){counts[targetIdx]=9+Math.floor(rng()*3);for(let i=0;i<4;i++)if(i!==targetIdx)counts[i]=5+Math.floor(rng()*3);}
  else{counts[targetIdx]=3+Math.floor(rng()*2);for(let i=0;i<4;i++)if(i!==targetIdx)counts[i]=7+Math.floor(rng()*3);}
  const grid=[];for(let i=0;i<4;i++)for(let j=0;j<counts[i];j++)grid.push(symbols[i]);

  const ansStr=symbols[targetIdx];
  const opts=shuffle([...symbols],rng);
  return {
    id:`frq-${Math.floor(rng()*1e6)}`, category:'atencion-percepcion',
    tags:['visual','frecuencia-simbolos'],
    question:askMost?'Cual es el simbolo que mas veces aparece?':'Cual es el simbolo que menos veces aparece?',
    options:opts, answer:opts.indexOf(ansStr),
    explanation:`${ansStr} aparece ${counts[targetIdx]} veces.`,
    visualType:'frecuencia-simbolos', visualData:{grid:shuffle(grid,rng),cols:7},
  };
}

// ============================================================
// 16. GRID COMPARISON
// ============================================================
function generateGridComparisonQuestion(rng) {
  const syms=['\u25CF','\u25B2','\u25A0','\u25C6','\u2605','\u2B22','\u271A','\u25CB'];
  const gridSize=16;
  const baseGrid=Array.from({length:gridSize},()=>pick(syms,rng));
  const howMany=Math.floor(rng()*4);
  const grids=[];

  if(howMany===3){for(let i=0;i<4;i++)grids.push([...baseGrid]);}
  else if(howMany===2){const di=Math.floor(rng()*4);for(let i=0;i<4;i++){if(i===di){const g=[...baseGrid];for(let c=0;c<1+Math.floor(rng()*2);c++){const p=Math.floor(rng()*gridSize);g[p]=pick(syms.filter(s=>s!==g[p]),rng);}grids.push(g);}else grids.push([...baseGrid]);}}
  else if(howMany===1){const si=pickN([0,1,2,3],2,rng);for(let i=0;i<4;i++){if(si.includes(i))grids.push([...baseGrid]);else{const g=[...baseGrid];for(let c=0;c<1+Math.floor(rng()*3);c++){const p=Math.floor(rng()*gridSize);g[p]=pick(syms.filter(s=>s!==g[p]),rng);}grids.push(g);}}}
  else{for(let i=0;i<4;i++){const g=[...baseGrid];for(let c=0;c<2+Math.floor(rng()*3);c++){const p=Math.floor(rng()*gridSize);g[p]=pick(syms.filter(s=>s!==g[p]),rng);}grids.push(g);}grids[0]=[...baseGrid];grids[1][0]=grids[1][0]===syms[0]?syms[1]:syms[0];grids[2][1]=grids[2][1]===syms[2]?syms[3]:syms[2];grids[3][2]=grids[3][2]===syms[4]?syms[5]:syms[4];}

  const answers=['Todos los cuadros son distintos','Hay dos cuadros iguales','Hay tres cuadros iguales','Todos los cuadros son iguales'];
  return {
    id:`gcm-${Math.floor(rng()*1e6)}`, category:'atencion-percepcion',
    tags:['visual','comparacion-cuadros'],
    question:'Observe los cuadros y conteste:',
    options:[...answers], answer:howMany,
    explanation:answers[howMany]+'.',
    visualType:'comparacion-cuadros', visualData:{grids,cols:4},
  };
}

// ============================================================
// 17. TABLE DATA
// ============================================================
function generateTableQuestion(rng) {
  const categories=[
    ['Escarabajos','Moscas','Mariposas','Chinches'],
    ['Manzanas','Peras','Naranjas','Platanos'],
    ['Fotocopias','Papel','Lapices','Boligrafos'],
  ];
  const parcels=['A','B','C','D'];
  const cats=pick(categories,rng);
  const data=[];for(let r=0;r<4;r++) data.push(Array.from({length:4},()=>(1+Math.floor(rng()*9))*100));
  const totals=[0,0,0,0];for(let c=0;c<4;c++)for(let r=0;r<4;r++)totals[c]+=data[r][c];
  const maxIdx=totals.indexOf(Math.max(...totals));
  const opts=shuffle([...parcels],rng);
  return {
    id:`tbl-${Math.floor(rng()*1e6)}`, category:'razonamiento-numerico',
    tags:['tabla-datos'],
    question:`En que parcela hay mayor numero total de especimenes?`,
    options:opts, answer:opts.indexOf(parcels[maxIdx]),
    explanation:`Parcela ${parcels[maxIdx]}: ${totals[maxIdx]} total.`,
    visualType:'tabla-datos', visualData:{headers:cats,parcels,data},
  };
}

// ============================================================
// 18. SILOGISMOS
// ============================================================
function generateSilogismoQuestion(rng) {
  const abstract = [
    {p:'Si P entonces Q. No Q.',o:['No P','Puede que P','Puede que no P','No puedo concluir nada'],a:0,e:'Modus tollens: si no Q, entonces no P.'},
    {p:'Si P entonces Q. P.',o:['Q','No Q','Puede que Q','No puedo concluir nada'],a:0,e:'Modus ponens: si P, entonces Q.'},
    {p:'Si P entonces Q. Q.',o:['P','No P','No puedo concluir nada','Puede que P'],a:2,e:'Afirmacion del consecuente: Q no implica P.'},
    {p:'Si P entonces Q. No P.',o:['No Q','Q','No puedo concluir nada','Puede que Q'],a:2,e:'Negacion del antecedente: no P no implica no Q.'},
  ];
  const categorical = [
    {p:'Todos los A son B. Todos los B son C.',o:['Todos los A son C','Todos los C son A','Algunos C son A','No puedo concluir nada'],a:0,e:'Silogismo transitivo.'},
    {p:'Todos los A son B. Algunos B son C.',o:['Todos los A son C','Algunos A son C','Ningun A es C','No puedo concluir nada'],a:3,e:'No se puede concluir: que algunos B sean C no implica nada sobre A.'},
    {p:'Ningun A es B. Todos los C son A.',o:['Ningun C es B','Algunos C son B','Todos los C son B','No puedo concluir nada'],a:0,e:'C es A y ningun A es B, luego ningun C es B.'},
    {p:'Todos los A son B. Ningun B es C.',o:['Ningun A es C','Algunos A son C','Todos los A son C','No puedo concluir nada'],a:0,e:'A es B y ningun B es C, luego ningun A es C.'},
    {p:'Todo A es B. Los C son B.',o:['Ningun C es A','Ningun A es C','Todos los C son A','Algunos C pueden ser A'],a:3,e:'Que ambos sean B no implica relacion directa, pero algunos C podrian ser A.'},
    {p:'Algunos A son B. Todos los B son C.',o:['Algunos A son C','Todos los A son C','Ningun A es C','No puedo concluir nada'],a:0,e:'Si algunos A son B y todo B es C, esos A tambien son C.'},
    {p:'Ningun A es B. Ningun B es C.',o:['Ningun A es C','Todos los A son C','Algunos A son C','No puedo concluir nada'],a:3,e:'Que A y C no sean B no dice nada sobre la relacion entre A y C.'},
    {p:'Todos los A son B. No todos los B son A.',o:['Algun B no es A','Todos los B son A','Ningun B es A','No puedo concluir nada'],a:0,e:'Si no todos los B son A, entonces algun B no es A.'},
  ];
  const realWorld = [
    {p:'Si tengo sed bebo agua. He bebido agua.',o:['He tenido sed','No he tenido sed','He bebido agua por otro motivo','No puedo concluir nada'],a:3,e:'Beber agua no implica que haya tenido sed (afirmacion del consecuente).'},
    {p:'Si hace buen dia vamos al campo. No ha hecho buen dia.',o:['No hemos ido al campo','Hemos ido al campo','Hemos ido a otro sitio','No puedo concluir nada'],a:3,e:'Que no haga buen dia no impide ir al campo por otra razon (negacion del antecedente).'},
    {p:'Si llueve, la calle se moja. La calle esta mojada.',o:['Ha llovido','No ha llovido','Alguien ha regado la calle','No puedo concluir nada'],a:3,e:'La calle puede mojarse sin lluvia (afirmacion del consecuente).'},
    {p:'Si llueve, la calle se moja. La calle esta seca.',o:['No ha llovido','Ha llovido poco','No puedo concluir nada','Puede que haya llovido'],a:0,e:'Modus tollens: si la calle esta seca, no ha llovido.'},
    {p:'A quien madruga Dios le ayuda. Los que se echan la siesta madrugan.',o:['Algunos de los que se echan la siesta madrugan','Dios ayuda solo a los que madrugan','Dios ayuda a los que se echan la siesta','No puedo concluir nada'],a:2,e:'Si madrugan y Dios ayuda a quien madruga, Dios les ayuda.'},
    {p:'Todos los que estudian aprueban. Pedro no ha aprobado.',o:['Pedro no ha estudiado','Pedro ha estudiado poco','Pedro ha tenido mala suerte','No puedo concluir nada'],a:0,e:'Modus tollens: si no aprueba, no ha estudiado.'},
    {p:'Si como mucho, engordo. No he engordado.',o:['No he comido mucho','He comido poco','He hecho ejercicio','No puedo concluir nada'],a:0,e:'Modus tollens: si no engordo, no he comido mucho.'},
    {p:'Todos los medicos son universitarios. Juan es universitario.',o:['Juan es medico','Juan no es medico','Juan puede ser medico','No puedo concluir nada'],a:3,e:'Ser universitario no implica ser medico (afirmacion del consecuente).'},
    {p:'Si estudio, apruebo. Si apruebo, mis padres estan contentos. He estudiado.',o:['Mis padres estan contentos','Mis padres no estan contentos','He aprobado pero mis padres no estan contentos','No puedo concluir nada'],a:0,e:'Cadena: estudio->apruebo->padres contentos.'},
    {p:'Ninguna fruta es artificial. La manzana es una fruta.',o:['La manzana no es artificial','La manzana puede ser artificial','Algunas manzanas son artificiales','No puedo concluir nada'],a:0,e:'Si ninguna fruta es artificial y la manzana es fruta, no es artificial.'},
  ];
  const subs=[['delfin','mamifero','hombre'],['gato','felino','animal'],['rosa','flor','planta'],['perro','canino','mascota'],['estudiante','persona','ciudadano'],['medico','profesional','trabajador'],['Madrid','capital','ciudad'],['soldado','militar','funcionario']];
  const type = Math.floor(rng() * 3);
  let t, question, opts;
  if (type === 0) {
    t = pick(abstract, rng);
    return {id:`sil-${Math.floor(rng()*1e6)}`,category:'razonamiento-logico',tags:['silogismo'],question:t.p+' ¿Cual seria la conclusion correcta?',options:t.o,answer:t.a,explanation:t.e};
  } else if (type === 1) {
    t = pick(categorical, rng);
    const s = pick(subs, rng);
    let premises = t.p.replace(/\bA\b/g,s[0]).replace(/\bB\b/g,s[1]).replace(/\bC\b/g,s[2]);
    opts = t.o.map(o => o.replace(/\bA\b/g,s[0]).replace(/\bB\b/g,s[1]).replace(/\bC\b/g,s[2]));
    return {id:`sil-${Math.floor(rng()*1e6)}`,category:'razonamiento-logico',tags:['silogismo'],question:premises+' ¿Cual seria la conclusion correcta?',options:opts,answer:t.a,explanation:t.e};
  } else {
    t = pick(realWorld, rng);
    return {id:`sil-${Math.floor(rng()*1e6)}`,category:'razonamiento-logico',tags:['silogismo'],question:t.p+' ¿Que se puede concluir?',options:t.o,answer:t.a,explanation:t.e};
  }
}

// ============================================================
// 19. SPHERE ROTATION (UVE 15 q31-36)
// Sphere divided into sections with different fills, rotates quarter-turns
// ============================================================
function generateSphereRotationQuestion(rng) {
  const SFILLS = ['empty','solid','black','gray','hatched','dotted'];
  // Sphere divided by a vertical line and horizontal line = 4 quadrants
  // But shown as a circle divided by a curved line (hemisphere view)
  // We'll use 2 or 3 sections like the UVE images
  const numSections = pick([2, 3, 4], rng);
  const fills = pickN(SFILLS, numSections, rng);
  if (new Set(fills).size < 2) fills[0] = pick(SFILLS.filter(f => f !== fills[1]), rng);

  // Divider style: vertical, horizontal, or diagonal
  const dividerType = pick(['vertical','horizontal','cross'], rng);
  // Rotation direction shown by arrow
  const clockwise = rng() > 0.5;
  const stepsPerTurn = numSections; // quarter turns match sections
  const rotateBy = 1; // rotate by 1 section each step

  const seqLen = 3 + Math.floor(rng() * 3);
  const sequence = [];
  for (let s = 0; s < seqLen; s++) {
    const rotated = [];
    for (let i = 0; i < numSections; i++) {
      const src = clockwise
        ? ((i - s * rotateBy) % numSections + numSections) % numSections
        : ((i + s * rotateBy) % numSections + numSections) % numSections;
      rotated.push(fills[src]);
    }
    sequence.push(rotated);
  }

  // Answer: next step
  const ansArr = [];
  for (let i = 0; i < numSections; i++) {
    const src = clockwise
      ? ((i - seqLen * rotateBy) % numSections + numSections) % numSections
      : ((i + seqLen * rotateBy) % numSections + numSections) % numSections;
    ansArr.push(fills[src]);
  }

  const ansStr = JSON.stringify(ansArr);
  const dist = safeDistractors(ansStr, 3, r => {
    const off = 1 + Math.floor(r() * 3);
    const d = [];
    for (let i = 0; i < numSections; i++) {
      const src = clockwise
        ? ((i - (seqLen + off) * rotateBy) % numSections + numSections) % numSections
        : ((i + (seqLen + off) * rotateBy) % numSections + numSections) % numSections;
      d.push(fills[src]);
    }
    return JSON.stringify(d);
  }, rng);
  { let ps = 0; while (dist.length < 3 && ps < 100) { ps++; const d = [...ansArr]; const si = Math.floor(rng()*numSections); d[si] = pick(SFILLS.filter(f=>f!==d[si]),rng); const ds = JSON.stringify(d); if(ds!==ansStr&&!dist.includes(ds)) dist.push(ds); } }

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `sph-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','esfera-rotacion'],
    question: 'Cual de las opciones sustituiria al interrogante si la esfera girase un cuarto de vuelta?',
    options: opts, answer: opts.indexOf(ansStr),
    explanation: `La esfera rota en sentido ${clockwise?'horario':'antihorario'}, los sectores se desplazan 1 posicion.`,
    visualType: 'esfera-rotacion', visualData: { sequence, sections: numSections, dividerType, clockwise },
  };
}

// ============================================================
// 20. SYMBOL ALPHABET (UVE 15 q6-10)
// Each letter maps to a symbol. Word = superposition of letter symbols.
// ============================================================
function generateSymbolAlphabetQuestion(rng) {
  // Build a simple symbol system: each letter gets a combination of elements
  // Elements: line positions (top,bottom,left,right,diag-tl,diag-tr), dot positions, small shapes
  const ELEMS = [
    'line-top','line-bottom','line-left','line-right',
    'diag-tl','diag-tr','diag-bl','diag-br',
    'dot-tl','dot-tr','dot-bl','dot-br','dot-center',
    'tri-up','tri-down','tri-left','tri-right',
  ];
  // Assign 2-3 elements per letter
  const alphabet = {};
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffledElems = shuffle([...ELEMS, ...ELEMS], rng); // double pool
  let ei = 0;
  for (const l of letters) {
    const count = 2 + Math.floor(rng() * 2); // 2-3 elements
    const elems = [];
    for (let i = 0; i < count && ei < shuffledElems.length; i++) {
      elems.push(shuffledElems[ei++]);
      if (ei >= shuffledElems.length) ei = 0;
    }
    alphabet[l] = elems;
  }

  // Pick a word of 4-7 letters
  const words = [
    'GATO','MESA','ROJO','AZUL','VIDA','LUNA','CASA','PATO','FLOR','RISA',
    'MANO','BOLA','CERO','DADO','FARO','HILO','JEFE','KILO','LAGO','NAVE',
    'ORAL','PIEL','REMO','SACO','TELA','URNA','VELA','YOGA','ZONA','ARCO',
  ];
  const word = pick(words, rng);

  // The correct overlay = union of all letter elements
  const correctElems = new Set();
  for (const ch of word) {
    if (alphabet[ch]) alphabet[ch].forEach(e => correctElems.add(e));
  }
  const correctArr = [...correctElems].sort();
  const ansStr = JSON.stringify(correctArr);

  // Generate distractors: swap one letter of the word
  const dist = safeDistractors(ansStr, 3, r => {
    const w = word.split('');
    const pos = Math.floor(r() * w.length);
    let alt = letters[Math.floor(r() * 26)];
    while (alt === w[pos]) alt = letters[Math.floor(r() * 26)];
    w[pos] = alt;
    const elems = new Set();
    for (const ch of w) { if (alphabet[ch]) alphabet[ch].forEach(e => elems.add(e)); }
    return JSON.stringify([...elems].sort());
  }, rng);

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `sym-${Math.floor(rng()*1e6)}`, category: 'atencion-percepcion',
    tags: ['visual','alfabeto-simbolos'],
    question: `Cual de las opciones corresponde a la palabra "${word}"?`,
    options: opts, answer: opts.indexOf(ansStr),
    explanation: `Superposicion de los simbolos de cada letra de "${word}".`,
    visualType: 'alfabeto-simbolos', visualData: { alphabet, word },
  };
}

// ============================================================
// 21. CHART INTERPRETATION (UVE 15 q1-5)
// Bar chart + line chart + pie chart, answer calculation questions
// ============================================================
function generateChartQuestion(rng) {
  // Generate a dataset: 4 years, values for a metric
  const startYear = 2004 + Math.floor(rng() * 10);
  const years = Array.from({length: 4}, (_, i) => startYear + i);

  // Bar data (e.g. "Inversion en miles de euros")
  const barBase = (5 + Math.floor(rng() * 15)) * 100;
  const barData = years.map((_, i) => barBase + Math.floor(rng() * barBase * 0.8));
  // Ensure some growth pattern
  barData.sort((a, b) => a - b + (rng() > 0.3 ? 0 : b - a));

  // Line data (e.g. "Personal")
  const lineBase = 10 + Math.floor(rng() * 40);
  const lineData = [lineBase];
  for (let i = 1; i < 4; i++) lineData.push(lineData[i-1] + Math.floor(rng() * 10) + 1);

  // Pie data (percentages summing to 100)
  const pieLabels = pick([
    ['Norte','Sur','Este','Oeste'],
    ['Madrid','Barcelona','Valencia','Sevilla'],
    ['Zona A','Zona B','Zona C','Zona D'],
  ], rng);
  const rawPie = [10 + Math.floor(rng() * 30), 10 + Math.floor(rng() * 30), 10 + Math.floor(rng() * 30)];
  rawPie.push(100 - rawPie[0] - rawPie[1] - rawPie[2]);
  if (rawPie[3] < 5) { rawPie[3] = 10; rawPie[0] -= 5; rawPie[1] -= 5; }
  const pieData = rawPie;

  // Generate a question about the data
  const qType = Math.floor(rng() * 5);
  let question, answer, explanation, options;

  if (qType === 0) {
    // % increase from year X to year X+1
    const yi = Math.floor(rng() * 3);
    const pct = Math.round((barData[yi+1] - barData[yi]) / barData[yi] * 100);
    question = `Cuanto se ha incrementado el valor en ${years[yi+1]} sobre ${years[yi]}?`;
    const correct = `${pct}%`;
    const d1 = `${pct + 5}%`, d2 = `${Math.max(1, pct - 3)}%`, d3 = `${pct + 10}%`;
    options = shuffle([correct, d1, d2, d3], rng);
    answer = options.indexOf(correct);
    explanation = `Incremento: (${barData[yi+1]}-${barData[yi]})/${barData[yi]} = ${pct}%.`;
  } else if (qType === 1) {
    // Which year has highest line value
    const maxI = lineData.indexOf(Math.max(...lineData));
    question = `En que ano es mas elevado el valor de personal?`;
    options = shuffle([...years.map(String)], rng);
    answer = options.indexOf(String(years[maxI]));
    explanation = `Ano ${years[maxI]}: ${lineData[maxI]} empleados.`;
  } else if (qType === 2) {
    // Pie: what value for region X in year Y
    const ri = Math.floor(rng() * 4);
    const yi = 2 + Math.floor(rng() * 2);
    const val = Math.round(barData[yi] * pieData[ri] / 100);
    question = `A cuanto asciende la inversion en la region ${pieLabels[ri]} en ${years[yi]}?`;
    const correct = `${val.toLocaleString('es-ES')}`;
    const d1 = `${(val + Math.floor(rng()*100+50)).toLocaleString('es-ES')}`;
    const d2 = `${Math.max(0, val - Math.floor(rng()*100+50)).toLocaleString('es-ES')}`;
    const d3 = `${(val + Math.floor(rng()*200+100)).toLocaleString('es-ES')}`;
    options = shuffle([correct, d1, d2, d3], rng);
    answer = options.indexOf(correct);
    explanation = `${pieLabels[ri]} = ${pieData[ri]}% de ${barData[yi]} = ${val}.`;
  } else if (qType === 3) {
    // Sum of bar values
    const total = barData.reduce((a, b) => a + b, 0);
    question = `Cual es la inversion total en los ${years.length} anos?`;
    const correct = `${total.toLocaleString('es-ES')}`;
    const d1 = `${(total + 500).toLocaleString('es-ES')}`;
    const d2 = `${(total - 300).toLocaleString('es-ES')}`;
    const d3 = `${(total + 1000).toLocaleString('es-ES')}`;
    options = shuffle([correct, d1, d2, d3], rng);
    answer = options.indexOf(correct);
    explanation = `Suma total: ${total.toLocaleString('es-ES')}.`;
  } else {
    // Difference between two years
    const y1 = Math.floor(rng() * 2), y2 = y1 + 1 + Math.floor(rng() * 2);
    const diff = barData[Math.min(y2, 3)] - barData[y1];
    question = `Cual es la diferencia de inversion entre ${years[Math.min(y2,3)]} y ${years[y1]}?`;
    const correct = `${diff.toLocaleString('es-ES')}`;
    const d1 = `${(diff + 200).toLocaleString('es-ES')}`;
    const d2 = `${Math.abs(diff - 150).toLocaleString('es-ES')}`;
    const d3 = `${(diff + 500).toLocaleString('es-ES')}`;
    options = shuffle([correct, d1, d2, d3], rng);
    answer = options.indexOf(correct);
    explanation = `Diferencia: ${barData[Math.min(y2,3)]} - ${barData[y1]} = ${diff}.`;
  }

  return {
    id: `cht-${Math.floor(rng()*1e6)}`, category: 'razonamiento-numerico',
    tags: ['visual','graficos-datos'],
    question,
    options, answer, explanation,
    visualType: 'graficos-datos', visualData: { years, barData, lineData, pieLabels, pieData },
  };
}

// ============================================================
// 22. CUBE NET FOLDING (UVE 32 q8, q13, q17-18)
// Show a cube net, identify which 3D view is correct
// ============================================================
function generateCubeNetQuestion(rng) {
  // 6 faces of a cube, each with a distinctive marking
  const MARKS = ['empty','dot','cross','line-h','line-v','diag','square','circle','triangle','hatched'];
  const faces = pickN(MARKS, 6, rng);
  // faces[0]=top, [1]=front, [2]=right, [3]=back, [4]=left, [5]=bottom

  // Net layout: cross-shaped (most common in UVE)
  // Pattern:    [top]
  //      [left][front][right][back]
  //             [bottom]
  const netLayout = 'cross';

  // When folded, visible faces from a corner view: top + front + right
  const visibleFaces = { top: faces[0], front: faces[1], right: faces[2] };
  const ansStr = JSON.stringify(visibleFaces);

  // Distractors: swap or rotate faces
  const dist = safeDistractors(ansStr, 3, r => {
    const swap = Math.floor(r() * 3);
    const vf = { ...visibleFaces };
    if (swap === 0) { vf.top = faces[5]; } // show bottom instead of top
    else if (swap === 1) { vf.front = faces[3]; } // show back instead of front
    else { vf.right = faces[4]; } // show left instead of right
    return JSON.stringify(vf);
  }, rng);
  // Fallback distractors
  { let ps = 0; while (dist.length < 3 && ps < 100) { ps++; const vf = { top: pick(MARKS, rng), front: pick(MARKS, rng), right: pick(MARKS, rng) }; const ds = JSON.stringify(vf); if (ds !== ansStr && !dist.includes(ds)) dist.push(ds); } }

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `cbn-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','cubo-desplegado'],
    question: 'Cual de las opciones corresponde al cubo desplegado?',
    options: opts, answer: opts.indexOf(ansStr),
    explanation: 'Al plegar la red, las caras visibles son: arriba, frente y derecha.',
    visualType: 'cubo-desplegado', visualData: { faces, netLayout },
  };
}

// ============================================================
// 23. CLOCK SERIES (UVE various - q21 style)
// Clocks showing times that follow a pattern
// ============================================================
function generateClockSeriesQuestion(rng) {
  const pat = Math.floor(rng() * 8);
  let sequence, answerTime, exp;

  // Time as {h: 0-11, m: 0-59}
  const startH = Math.floor(rng() * 12);
  const startM = Math.floor(rng() * 4) * 15; // 0,15,30,45

  if (pat === 0) {
    // Add constant minutes each step
    const addM = pick([15, 20, 30, 45], rng);
    const len = 4 + Math.floor(rng() * 3);
    sequence = [];
    for (let i = 0; i < len; i++) {
      const totalM = (startH * 60 + startM + i * addM);
      sequence.push({ h: Math.floor(totalM / 60) % 12, m: totalM % 60 });
    }
    const totalM = (startH * 60 + startM + len * addM);
    answerTime = { h: Math.floor(totalM / 60) % 12, m: totalM % 60 };
    exp = `Se suman ${addM} minutos en cada paso.`;
  } else if (pat === 1) {
    // Add constant hours
    const addH = pick([1, 2, 3], rng);
    const len = 5;
    sequence = [];
    for (let i = 0; i < len; i++) {
      sequence.push({ h: (startH + i * addH) % 12, m: startM });
    }
    answerTime = { h: (startH + len * addH) % 12, m: startM };
    exp = `Se suman ${addH} hora(s) en cada paso.`;
  } else if (pat === 2) {
    // Hour increases, minute decreases
    const addH = 1, subM = 15;
    const len = 4;
    sequence = [];
    for (let i = 0; i < len; i++) {
      sequence.push({ h: (startH + i * addH) % 12, m: ((startM - i * subM) % 60 + 60) % 60 });
    }
    answerTime = { h: (startH + len * addH) % 12, m: ((startM - len * subM) % 60 + 60) % 60 };
    exp = `Hora +${addH}, minutos -${subM} en cada paso.`;
  } else if (pat === 3) {
    // Increasing increments: +15, +30, +45, +60...
    const baseAdd = pick([10, 15, 20], rng);
    const len = 4;
    sequence = [];
    let acc = startH * 60 + startM;
    for (let i = 0; i < len; i++) {
      sequence.push({ h: Math.floor(acc / 60) % 12, m: acc % 60 });
      acc += baseAdd * (i + 1);
    }
    answerTime = { h: Math.floor(acc / 60) % 12, m: acc % 60 };
    exp = `Incrementos crecientes: +${baseAdd}, +${baseAdd*2}, +${baseAdd*3}...`;
  } else if (pat === 4) {
    // Mirror: hour hand and minute swap concept
    const addM = pick([30, 45, 60], rng);
    const len = 5;
    sequence = [];
    for (let i = 0; i < len; i++) {
      const totalM = (startH * 60 + startM + i * addM);
      sequence.push({ h: Math.floor(totalM / 60) % 12, m: totalM % 60 });
    }
    const totalM = (startH * 60 + startM + len * addM);
    answerTime = { h: Math.floor(totalM / 60) % 12, m: totalM % 60 };
    exp = `Se suman ${addM} minutos en cada paso.`;
  } else if (pat === 5) {
    // Alternating: +1h, -30min, +1h, -30min
    const len = 6;
    sequence = [];
    let acc = startH * 60 + startM;
    for (let i = 0; i < len; i++) {
      sequence.push({ h: Math.floor(acc / 60) % 12, m: ((acc % 60) + 60) % 60 });
      acc += (i % 2 === 0) ? 60 : -30;
    }
    answerTime = { h: Math.floor(acc / 60) % 12, m: ((acc % 60) + 60) % 60 };
    exp = 'Alterna: +1 hora, -30 minutos.';
  } else if (pat === 6) {
    // Subtract constant
    const subM = pick([15, 20, 30], rng);
    const len = 5;
    sequence = [];
    for (let i = 0; i < len; i++) {
      const totalM = ((startH * 60 + startM - i * subM) % 720 + 720) % 720;
      sequence.push({ h: Math.floor(totalM / 60) % 12, m: totalM % 60 });
    }
    const totalM = ((startH * 60 + startM - len * subM) % 720 + 720) % 720;
    answerTime = { h: Math.floor(totalM / 60) % 12, m: totalM % 60 };
    exp = `Se restan ${subM} minutos en cada paso.`;
  } else {
    // Double the increment: +15, +30, +60, +120
    const base = 15;
    const len = 4;
    sequence = [];
    let acc = startH * 60 + startM;
    for (let i = 0; i < len; i++) {
      sequence.push({ h: Math.floor(acc / 60) % 12, m: acc % 60 });
      acc += base * Math.pow(2, i);
    }
    answerTime = { h: Math.floor(acc / 60) % 12, m: acc % 60 };
    exp = `Incrementos que se duplican: +15, +30, +60, +120 min.`;
  }

  const ansStr = JSON.stringify(answerTime);
  const dist = safeDistractors(ansStr, 3, r => {
    const t = { ...answerTime };
    const mod = Math.floor(r() * 4);
    if (mod === 0) t.h = (t.h + 1 + Math.floor(r() * 3)) % 12;
    else if (mod === 1) t.m = (t.m + 15 + Math.floor(r() * 3) * 15) % 60;
    else if (mod === 2) { t.h = (t.h + 6) % 12; }
    else { t.m = (t.m + 30) % 60; t.h = (t.h + 1) % 12; }
    return JSON.stringify(t);
  }, rng);

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `clk-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','reloj-serie'],
    question: 'Que reloj completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'reloj-serie', visualData: { sequence },
  };
}

// ============================================================
// 24. LETTER GRID + SHADED OVERLAY (UVE various - q20 style)
// Grid of letters with shaded squares, identify letters under shading
// ============================================================
function generateLetterGridQuestion(rng) {
  const rows = 5, cols = pick([4, 5, 6], rng);
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grid = Array.from({ length: rows * cols }, () => ABC[Math.floor(rng() * 26)]);

  // Create a small shading pattern (3-5 shaded cells)
  const numShaded = 3 + Math.floor(rng() * 3);
  const allPositions = Array.from({ length: rows * cols }, (_, i) => i);
  const shadedPositions = pickN(allPositions, numShaded, rng).sort((a, b) => a - b);

  // The correct answer: letters under shaded cells, concatenated
  const correctLetters = shadedPositions.map(p => grid[p]).join('');

  // Generate distractors: shift positions, swap some letters
  const dist = safeDistractors(correctLetters, 3, r => {
    const shifted = shadedPositions.map(p => {
      const off = Math.floor(r() * 3) - 1 + (r() > 0.5 ? cols : -cols);
      return ((p + off) % (rows * cols) + (rows * cols)) % (rows * cols);
    });
    return shifted.map(p => grid[p]).join('');
  }, rng);

  const opts = shuffle([correctLetters, ...dist.slice(0, 3)], rng);
  return {
    id: `lgr-${Math.floor(rng()*1e6)}`, category: 'atencion-percepcion',
    tags: ['visual','letras-sombreadas'],
    question: 'Que letras se encuentran en las casillas sombreadas?',
    options: opts, answer: opts.indexOf(correctLetters),
    explanation: `Las letras sombreadas son: ${correctLetters}.`,
    visualType: 'letras-sombreadas', visualData: { grid, cols, shadedPositions },
  };
}

// ============================================================
// 25. RADIAL SECTOR SQUARE SERIES (UVE 25 q1-5)
// Squares divided by lines radiating from center, sections shaded
// ============================================================
function generateRadialSectorQuestion(rng) {
  // Square divided into 8 triangular sectors by 4 lines through center
  // (horizontal, vertical, two diagonals)
  // Each sector: empty, solid (filled), or hatched
  const numSectors = 8;
  const RFILLS = ['empty', 'solid', 'hatched'];

  const pat = Math.floor(rng() * 6);
  let sequence, answerSectors, exp;

  if (pat === 0) {
    // Rotate all sectors clockwise by 1 each step
    const base = Array.from({ length: numSectors }, () => pick(RFILLS, rng));
    if (base.filter(f => f === 'solid').length < 2) { base[0] = 'solid'; base[3] = 'solid'; }
    if (base.filter(f => f === 'hatched').length < 1) base[2] = 'hatched';
    const rotBy = pick([1, 2, 3], rng);
    const len = 6 + Math.floor(rng() * 3);
    sequence = [];
    for (let s = 0; s < len; s++) {
      sequence.push(Array.from({ length: numSectors }, (_, i) => base[((i - s * rotBy) % numSectors + numSectors) % numSectors]));
    }
    answerSectors = Array.from({ length: numSectors }, (_, i) => base[((i - len * rotBy) % numSectors + numSectors) % numSectors]);
    exp = `Los sectores rotan ${rotBy} posicion(es) en sentido horario cada paso.`;
  } else if (pat === 1) {
    // One sector fills/empties per step (filling sequence)
    const order = shuffle([0, 1, 2, 3, 4, 5, 6, 7], rng);
    const len = 6;
    sequence = [];
    for (let s = 0; s < len; s++) {
      const sectors = Array.from({ length: numSectors }, () => 'empty');
      for (let j = 0; j <= s; j++) sectors[order[j % 8]] = 'solid';
      sequence.push(sectors);
    }
    const ansSectors = Array.from({ length: numSectors }, () => 'empty');
    for (let j = 0; j <= len; j++) ansSectors[order[j % 8]] = 'solid';
    answerSectors = ansSectors;
    exp = 'Se llena un sector adicional en cada paso.';
  } else if (pat === 2) {
    // Alternating pattern: even steps have pattern A, odd steps have pattern B
    const patA = Array.from({ length: numSectors }, (_, i) => i % 2 === 0 ? 'solid' : 'empty');
    const patB = Array.from({ length: numSectors }, (_, i) => i % 2 === 0 ? 'empty' : 'solid');
    // Plus one sector changes fill each step
    const changeIdx = Math.floor(rng() * numSectors);
    const len = 7;
    sequence = [];
    for (let s = 0; s < len; s++) {
      const base = s % 2 === 0 ? [...patA] : [...patB];
      if (s >= 2) base[changeIdx] = 'hatched';
      sequence.push(base);
    }
    const base2 = len % 2 === 0 ? [...patA] : [...patB];
    base2[changeIdx] = 'hatched';
    answerSectors = base2;
    exp = 'Patron alterna par/impar con un sector fijo rayado.';
  } else if (pat === 3) {
    // Mirror: top half mirrors to bottom half progressively
    const topBase = Array.from({ length: 4 }, () => pick(RFILLS, rng));
    if (topBase.every(f => f === 'empty')) topBase[0] = 'solid';
    const rotBy = 1;
    const len = 6;
    sequence = [];
    for (let s = 0; s < len; s++) {
      const top = Array.from({ length: 4 }, (_, i) => topBase[((i - s * rotBy) % 4 + 4) % 4]);
      const bottom = [...top].reverse();
      sequence.push([...top, ...bottom]);
    }
    const topFinal = Array.from({ length: 4 }, (_, i) => topBase[((i - len * rotBy) % 4 + 4) % 4]);
    answerSectors = [...topFinal, ...topFinal.reverse()];
    exp = 'La mitad superior rota y la inferior es su reflejo.';
  } else if (pat === 4) {
    // Two sectors switch fill each step
    const base = Array.from({ length: numSectors }, () => 'empty');
    base[0] = 'solid'; base[4] = 'solid';
    const len = 7;
    sequence = [];
    for (let s = 0; s < len; s++) {
      const sectors = [...base];
      sectors[(0 + s) % numSectors] = 'solid';
      sectors[(4 + s) % numSectors] = 'solid';
      if (s > 0) { sectors[(0 + s - 1) % numSectors] = 'empty'; sectors[(4 + s - 1) % numSectors] = 'empty'; }
      // Keep at least the moving ones solid
      for (let k = 0; k < numSectors; k++) if (k !== (0 + s) % numSectors && k !== (4 + s) % numSectors) sectors[k] = 'empty';
      sequence.push(sectors);
    }
    const ansSectors = Array.from({ length: numSectors }, () => 'empty');
    ansSectors[(0 + len) % numSectors] = 'solid';
    ansSectors[(4 + len) % numSectors] = 'solid';
    answerSectors = ansSectors;
    exp = 'Dos sectores opuestos se desplazan en sentido horario.';
  } else {
    // Sectors fill in pairs: 0+4, 1+5, 2+6, 3+7
    const fillOrder = shuffle([0, 1, 2, 3], rng);
    const len = 6;
    sequence = [];
    for (let s = 0; s < len; s++) {
      const sectors = Array.from({ length: numSectors }, () => 'empty');
      for (let j = 0; j < Math.min(s + 1, 4); j++) {
        sectors[fillOrder[j]] = 'solid';
        sectors[fillOrder[j] + 4] = 'hatched';
      }
      sequence.push(sectors);
    }
    const ansSectors = Array.from({ length: numSectors }, () => 'empty');
    for (let j = 0; j < Math.min(len + 1, 4); j++) {
      ansSectors[fillOrder[j]] = 'solid';
      ansSectors[fillOrder[j] + 4] = 'hatched';
    }
    answerSectors = ansSectors;
    exp = 'Sectores opuestos se llenan en pares (solido arriba, rayado abajo).';
  }

  const ansStr = JSON.stringify(answerSectors);
  const dist = safeDistractors(ansStr, 3, r => {
    const d = [...answerSectors];
    // Rotate by random offset
    const off = 1 + Math.floor(r() * 3);
    const rotated = Array.from({ length: numSectors }, (_, i) => d[((i - off) % numSectors + numSectors) % numSectors]);
    // Maybe swap one fill
    if (r() > 0.5) {
      const si = Math.floor(r() * numSectors);
      rotated[si] = RFILLS[Math.floor(r() * RFILLS.length)];
    }
    return JSON.stringify(rotated);
  }, rng);
  { let ps = 0; while (dist.length < 3 && ps < 100) { ps++; const d = [...answerSectors]; d[Math.floor(rng() * numSectors)] = pick(RFILLS, rng); const ds = JSON.stringify(d); if (ds !== ansStr && !dist.includes(ds)) dist.push(ds); } }

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `rds-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','sectores-radiales'],
    question: 'Que figura completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'sectores-radiales', visualData: { sequence },
  };
}

// ============================================================
// 26. NUMBER PAIR SERIES (UVE 26 q6-11 style)
// Two-row number boxes, some shaded, find next pair
// ============================================================
function generateNumberPairSeriesQuestion(rng) {
  const pat = Math.floor(rng() * 8);
  let sequence, answerPair, exp;

  if (pat === 0) {
    // Top: +1 each, Bottom: -1 each
    const t0 = 1 + Math.floor(rng() * 8), b0 = 5 + Math.floor(rng() * 5);
    const len = 6 + Math.floor(rng() * 3);
    sequence = Array.from({ length: len }, (_, i) => ({ top: t0 + i, bot: b0 - i, shaded: i % 2 === 0 }));
    answerPair = { top: t0 + len, bot: b0 - len, shaded: len % 2 === 0 };
    exp = `Superior +1, inferior -1 en cada paso.`;
  } else if (pat === 1) {
    // Top: sum of digits pattern, Bot: product
    const t0 = 1 + Math.floor(rng() * 5), b0 = 2 + Math.floor(rng() * 7);
    const len = 7;
    sequence = Array.from({ length: len }, (_, i) => ({ top: t0 + i * 2, bot: b0 + i * 3, shaded: (i % 3) === 0 }));
    answerPair = { top: t0 + len * 2, bot: b0 + len * 3, shaded: (len % 3) === 0 };
    exp = `Superior +2, inferior +3 en cada paso.`;
  } else if (pat === 2) {
    // Top * Bot = constant
    const product = (2 + Math.floor(rng() * 4)) * (2 + Math.floor(rng() * 4));
    const divisors = [];
    for (let d = 1; d <= product; d++) if (product % d === 0) divisors.push(d);
    const pairs = divisors.map(d => ({ top: d, bot: product / d }));
    const len = Math.min(pairs.length, 7);
    sequence = pairs.slice(0, len).map((p, i) => ({ ...p, shaded: i % 2 === 1 }));
    const ansPair = pairs[len] || { top: pairs[0].bot, bot: pairs[0].top };
    answerPair = { ...ansPair, shaded: len % 2 === 1 };
    exp = `El producto superior x inferior = ${product} es constante.`;
  } else if (pat === 3) {
    // Top: Fibonacci-like, Bot: decreasing
    const len = 7;
    const tops = [1, 1];
    for (let i = 2; i < len + 1; i++) tops.push(tops[i - 1] + tops[i - 2]);
    const b0 = 20 + Math.floor(rng() * 10);
    sequence = Array.from({ length: len }, (_, i) => ({ top: tops[i], bot: b0 - i * 2, shaded: i % 2 === 0 }));
    answerPair = { top: tops[len], bot: b0 - len * 2, shaded: len % 2 === 0 };
    exp = `Superior: serie Fibonacci. Inferior: -2 cada paso.`;
  } else if (pat === 4) {
    // Top: squares, Bot: cubes (mod small)
    const len = 6;
    const start = 1 + Math.floor(rng() * 3);
    sequence = Array.from({ length: len }, (_, i) => ({
      top: (start + i) * (start + i) % 100,
      bot: ((start + i) * 3) % 100,
      shaded: (i + 1) % 3 === 0
    }));
    answerPair = { top: (start + len) * (start + len) % 100, bot: ((start + len) * 3) % 100, shaded: (len + 1) % 3 === 0 };
    exp = `Superior: cuadrados. Inferior: multiplos de 3.`;
  } else if (pat === 5) {
    // Both alternate: +3/-1 top, +1/-2 bot
    const len = 8;
    let t = 3 + Math.floor(rng() * 5), b = 7 + Math.floor(rng() * 3);
    sequence = [];
    for (let i = 0; i < len; i++) {
      sequence.push({ top: t, bot: b, shaded: i % 2 === 0 });
      t += (i % 2 === 0) ? 3 : -1;
      b += (i % 2 === 0) ? 1 : -2;
    }
    answerPair = { top: t, bot: b, shaded: len % 2 === 0 };
    exp = `Superior alterna +3/-1. Inferior alterna +1/-2.`;
  } else if (pat === 6) {
    // Top = previous bot, Bot = top + bot (shifted Fibonacci pairs)
    const len = 6;
    let t = 1 + Math.floor(rng() * 3), b = 2 + Math.floor(rng() * 3);
    sequence = [{ top: t, bot: b, shaded: false }];
    for (let i = 1; i < len; i++) {
      const newT = b;
      const newB = t + b;
      t = newT; b = newB;
      sequence.push({ top: t, bot: b, shaded: i % 2 === 1 });
    }
    answerPair = { top: b, bot: t + b, shaded: len % 2 === 1 };
    exp = `Superior(n) = Inferior(n-1). Inferior(n) = Superior(n-1) + Inferior(n-1).`;
  } else {
    // Top: +2 each, Bot: sum of all previous tops
    const len = 6;
    const t0 = 1 + Math.floor(rng() * 3);
    let sum = 0;
    sequence = [];
    for (let i = 0; i < len; i++) {
      const top = t0 + i * 2;
      sum += top;
      sequence.push({ top, bot: sum, shaded: (i % 2) === 0 });
    }
    const ansTop = t0 + len * 2;
    answerPair = { top: ansTop, bot: sum + ansTop, shaded: (len % 2) === 0 };
    exp = `Superior: +2. Inferior: suma acumulada de superiores.`;
  }

  const ansStr = JSON.stringify(answerPair);
  const dist = safeDistractors(ansStr, 3, r => {
    const d = { ...answerPair };
    const mod = Math.floor(r() * 3);
    if (mod === 0) d.top += Math.floor(r() * 5) - 2;
    else if (mod === 1) d.bot += Math.floor(r() * 5) - 2;
    else { d.top += Math.floor(r() * 3) + 1; d.bot -= Math.floor(r() * 3) + 1; }
    d.shaded = r() > 0.5;
    return JSON.stringify(d);
  }, rng);

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `nps-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','series-pares-numeros'],
    question: 'Que par de numeros completa la serie?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'series-pares-numeros', visualData: { sequence },
  };
}

// ============================================================
// 27. LETTER COINCIDENCE (UVE 35 q1-7)
// Count matching letters between reference word and options
// ============================================================
function generateLetterCoincidenceQuestion(rng) {
  const wordPairs = [
    { ref: 'LACONICO', opts: ['CONDICIONAL', 'CORTO', 'COMPENDIOSO', 'PROLIJO'] },
    { ref: 'EXTENSO', opts: ['VASTO', 'DILATADO', 'LARGO', 'LEJOS'] },
    { ref: 'COMPETITIVIDAD', opts: ['GANADOR', 'PERDEDOR', 'FINAL', 'META'] },
    { ref: 'BORRADOR', opts: ['PIZARRA', 'BOLIGRAFO', 'PROYECTOR', 'REPROGRAFIA'] },
    { ref: 'ARQUEOLOGIA', opts: ['MAESTRA', 'ESCRITOR', 'QUEBRADURA', 'GRAMATICA'] },
    { ref: 'ARGENTINA', opts: ['COSTARRICENSE', 'NORTEAMERICANA', 'NICARAGUENSE', 'GUATEMALTECA'] },
    { ref: 'IGLESIAS', opts: ['BRICENO', 'FERNANDEZ', 'QUINTANILLA', 'ECHEGARAY'] },
    { ref: 'TELEVISION', opts: ['PELICULA', 'ORDENADOR', 'INTERNET', 'PANTALLA'] },
    { ref: 'BIBLIOTECA', opts: ['ESTANTERIA', 'LIBRERO', 'CATALOGO', 'LECTURA'] },
    { ref: 'UNIVERSIDAD', opts: ['DOCTORADO', 'CATEDRA', 'INSTITUTO', 'EDUCACION'] },
    { ref: 'DEMOCRACIA', opts: ['MONARQUIA', 'REPUBLICA', 'DICTADURA', 'ANARQUIA'] },
    { ref: 'MATEMATICAS', opts: ['GEOMETRIA', 'ALGEBRA', 'ESTADISTICA', 'CALCULO'] },
  ];

  // Count matching letters (with repetition)
  function countMatching(word1, word2) {
    const freq1 = {};
    for (const c of word1.toUpperCase()) freq1[c] = (freq1[c] || 0) + 1;
    let count = 0;
    const used = { ...freq1 };
    for (const c of word2.toUpperCase()) {
      if (used[c] && used[c] > 0) { count++; used[c]--; }
    }
    return count;
  }

  const pair = pick(wordPairs, rng);
  const ref = pair.ref;
  const opts = pair.opts;
  const counts = opts.map(o => countMatching(ref, o));

  // Question type: most, least, exactly N, most consonants, most vowels
  const qType = Math.floor(rng() * 5);
  const vowels = 'AEIOU';

  function countMatchingType(word1, word2, type) {
    const f1 = {};
    for (const c of word1.toUpperCase()) {
      if (type === 'vowels' && !vowels.includes(c)) continue;
      if (type === 'consonants' && (vowels.includes(c) || !/[A-Z]/.test(c))) continue;
      f1[c] = (f1[c] || 0) + 1;
    }
    let count = 0;
    const used = { ...f1 };
    for (const c of word2.toUpperCase()) {
      if (type === 'vowels' && !vowels.includes(c)) continue;
      if (type === 'consonants' && (vowels.includes(c) || !/[A-Z]/.test(c))) continue;
      if (used[c] && used[c] > 0) { count++; used[c]--; }
    }
    return count;
  }

  let question, correctIdx, explanation;

  if (qType === 0) {
    // Most matching letters
    const max = Math.max(...counts);
    correctIdx = counts.indexOf(max);
    question = `Cual de las siguientes palabras tiene mas letras coincidentes con las de la palabra ${ref}?`;
    explanation = `${opts[correctIdx]} tiene ${max} letras coincidentes con ${ref}.`;
  } else if (qType === 1) {
    // Least matching letters
    const min = Math.min(...counts);
    correctIdx = counts.indexOf(min);
    question = `Cual de las siguientes palabras tiene menos letras coincidentes con las de la palabra ${ref}?`;
    explanation = `${opts[correctIdx]} tiene ${min} letras coincidentes con ${ref}.`;
  } else if (qType === 2) {
    // Most matching consonants
    const consonantCounts = opts.map(o => countMatchingType(ref, o, 'consonants'));
    const max = Math.max(...consonantCounts);
    correctIdx = consonantCounts.indexOf(max);
    question = `Cual de las siguientes palabras tiene mas consonantes coincidentes con las de la palabra ${ref}?`;
    explanation = `${opts[correctIdx]} tiene ${max} consonantes coincidentes.`;
  } else if (qType === 3) {
    // Least matching vowels
    const vowelCounts = opts.map(o => countMatchingType(ref, o, 'vowels'));
    const min = Math.min(...vowelCounts);
    correctIdx = vowelCounts.indexOf(min);
    question = `Cual de las siguientes palabras tiene menos vocales coincidentes con las de la palabra ${ref}?`;
    explanation = `${opts[correctIdx]} tiene ${min} vocales coincidentes.`;
  } else {
    // Exactly N matching
    const target = counts[Math.floor(rng() * counts.length)];
    correctIdx = counts.indexOf(target);
    question = `Cual de las siguientes palabras tiene exactamente ${target} letras coincidentes con las de la palabra ${ref}?`;
    explanation = `${opts[correctIdx]} tiene exactamente ${target} letras coincidentes con ${ref}.`;
  }

  return {
    id: `lco-${Math.floor(rng()*1e6)}`, category: 'atencion-percepcion',
    tags: ['letras-coincidentes'],
    question, options: [...opts], answer: correctIdx, explanation,
  };
}

// ============================================================
// 28. CLOZE TEXT COMPLETION (UVE various q34-38)
// Fill blanks in a passage with correct words
// ============================================================
function generateClozeQuestion(rng) {
  const passages = [
    {
      text: 'Muchos dias __(1)__ sola por la Pedriza. Es una aficion que desde que la comence hace siete anos se ha convertido en una costumbre. Caminar por sus escarpadas __(2)__ y subir a la pena de la Tortuga hace que por unas horas __(3)__ olvidando el estres.',
      blanks: [
        { correct: 'deambulo', opts: ['corro', 'deambulo', 'caminan', 'desayunan'] },
        { correct: 'sendas', opts: ['caminos', 'sendas', 'carretera', 'pistas'] },
        { correct: 'continue', opts: ['termine', 'comience', 'continue', 'aumente'] },
      ]
    },
    {
      text: 'La __(1)__ es una ciencia que estudia los seres vivos. Los __(2)__ son organismos formados por celulas que realizan funciones __(3)__ para mantener la vida.',
      blanks: [
        { correct: 'biologia', opts: ['biologia', 'quimica', 'fisica', 'geologia'] },
        { correct: 'animales', opts: ['minerales', 'animales', 'vegetales', 'liquidos'] },
        { correct: 'esenciales', opts: ['opcionales', 'esenciales', 'artificiales', 'mecanicas'] },
      ]
    },
    {
      text: 'El __(1)__ es un fenomeno atmosferico que se produce cuando el aire caliente __(2)__ y se enfria al ganar altitud. Al __(3)__ la temperatura, el vapor de agua se condensa formando nubes.',
      blanks: [
        { correct: 'viento', opts: ['rayo', 'viento', 'trueno', 'granizo'] },
        { correct: 'asciende', opts: ['desciende', 'asciende', 'circula', 'permanece'] },
        { correct: 'descender', opts: ['aumentar', 'descender', 'mantener', 'elevar'] },
      ]
    },
    {
      text: 'Durante el __(1)__ los dias son mas largos y las temperaturas __(2)__. La naturaleza se muestra en todo su __(3)__ con flores y vegetacion abundante.',
      blanks: [
        { correct: 'verano', opts: ['invierno', 'verano', 'otono', 'amanecer'] },
        { correct: 'aumentan', opts: ['disminuyen', 'aumentan', 'fluctuan', 'desaparecen'] },
        { correct: 'esplendor', opts: ['declive', 'esplendor', 'deterioro', 'silencio'] },
      ]
    },
    {
      text: 'La __(1)__ de un pais depende en gran medida de su sistema __(2)__. Los ciudadanos deben __(3)__ activamente en los procesos democraticos para garantizar el bienestar comun.',
      blanks: [
        { correct: 'prosperidad', opts: ['decadencia', 'prosperidad', 'ruina', 'soledad'] },
        { correct: 'educativo', opts: ['carcelario', 'educativo', 'monetario', 'militar'] },
        { correct: 'participar', opts: ['abstenerse', 'participar', 'retirarse', 'huir'] },
      ]
    },
    {
      text: 'El __(1)__ espacial ha permitido al ser humano __(2)__ los confines del universo. Los telescopios modernos pueden __(3)__ galaxias a millones de anos luz de distancia.',
      blanks: [
        { correct: 'programa', opts: ['programa', 'fracaso', 'accidente', 'rechazo'] },
        { correct: 'explorar', opts: ['ignorar', 'explorar', 'destruir', 'olvidar'] },
        { correct: 'observar', opts: ['ocultar', 'observar', 'eliminar', 'reducir'] },
      ]
    },
  ];

  const passage = pick(passages, rng);
  // Pick one blank to ask about
  const blankIdx = Math.floor(rng() * passage.blanks.length);
  const blank = passage.blanks[blankIdx];
  const shuffledOpts = shuffle([...blank.opts], rng);

  return {
    id: `clz-${Math.floor(rng()*1e6)}`, category: 'razonamiento-verbal',
    tags: ['texto-completar'],
    question: `Complete el texto: "${passage.text.replace(`__(${blankIdx + 1})__`, '_____')}"`,
    options: shuffledOpts,
    answer: shuffledOpts.indexOf(blank.correct),
    explanation: `La palabra correcta es "${blank.correct}".`,
  };
}

// ============================================================
// 29. ARROW DIRECTION MATRIX (UVE various Q41-42)
// 3x3 grid where arrows vary by direction per row and fill per column
// ============================================================
function generateArrowMatrixQuestion(rng) {
  const DIRS = [0, 90, 180, 270]; // right, down, left, up
  const ARROW_FILLS = ['outline', 'filled', 'gray'];
  const ARROW_STYLES = ['simple', 'bold', 'double'];

  const pat = Math.floor(rng() * 4);
  let grid, answer, exp;

  if (pat === 0) {
    // Row = direction, Col = fill
    const rowDirs = pickN(DIRS, 3, rng);
    const colFills = pickN(ARROW_FILLS, 3, rng);
    grid = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      grid.push({ dir: rowDirs[r], fill: colFills[c], style: 'simple' });
    answer = grid[8]; grid = grid.slice(0, 8);
    exp = 'Fila=direccion, columna=relleno.';
  } else if (pat === 1) {
    // Row = fill, Col = direction, style changes diagonally
    const colDirs = pickN(DIRS, 3, rng);
    const rowFills = pickN(ARROW_FILLS, 3, rng);
    const styles3 = pickN(ARROW_STYLES, 3, rng);
    grid = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      grid.push({ dir: colDirs[c], fill: rowFills[r], style: styles3[(r + c) % 3] });
    answer = grid[8]; grid = grid.slice(0, 8);
    exp = 'Fila=relleno, columna=direccion, estilo rota diagonalmente.';
  } else if (pat === 2) {
    // Direction rotates 90deg per column, fill changes per row
    const startDir = pick(DIRS, rng);
    const rowFills = pickN(ARROW_FILLS, 3, rng);
    grid = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      grid.push({ dir: (startDir + c * 90) % 360, fill: rowFills[r], style: 'simple' });
    answer = grid[8]; grid = grid.slice(0, 8);
    exp = 'Direccion +90 grados por columna, relleno por fila.';
  } else {
    // Latin square: each direction appears once per row and column
    const d3 = pickN(DIRS, 3, rng);
    const f3 = pickN(ARROW_FILLS, 3, rng);
    const orders = [[0,1,2],[1,2,0],[2,0,1]];
    grid = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      grid.push({ dir: d3[orders[r][c]], fill: f3[c], style: 'simple' });
    answer = grid[8]; grid = grid.slice(0, 8);
    exp = 'Cuadrado latino: cada direccion aparece una vez por fila y columna.';
  }

  const ansStr = JSON.stringify(answer);
  const dist = safeDistractors(ansStr, 3, r => {
    return JSON.stringify({
      dir: DIRS[Math.floor(r() * 4)],
      fill: ARROW_FILLS[Math.floor(r() * 3)],
      style: answer.style
    });
  }, rng);

  const opts = shuffle([ansStr, ...dist.slice(0, 3)], rng);
  return {
    id: `arm-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','matriz-flechas'],
    question: 'Que flecha completa la matriz?',
    options: opts, answer: opts.indexOf(ansStr), explanation: exp,
    visualType: 'matriz-flechas', visualData: { grid },
  };
}

// ============================================================
// 30. CUBE/BLOCK COUNTING (UVE 44 Q56)
// Count cubes in isometric 3D arrangement
// ============================================================
function generateCubeCountingQuestion(rng) {
  // Generate a small 3D arrangement: layers of cubes on a grid
  // Base grid 3x3 or 4x3, heights 0-3
  const cols = 3 + Math.floor(rng() * 2);
  const rows = 3;
  const heights = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // Heights tend to be higher in the center and lower at edges
      const maxH = 3;
      const h = Math.floor(rng() * (maxH + 1));
      row.push(h);
    }
    heights.push(row);
  }
  // Ensure some structure
  if (heights[0].every(h => h === 0)) heights[0][1] = 2;
  if (heights[1].every(h => h === 0)) heights[1][0] = 1;

  // Count total cubes (all cubes including hidden ones)
  const total = heights.flat().reduce((s, h) => s + h, 0);

  const correct = String(total);
  const d1 = String(total + 1), d2 = String(total - 1), d3 = String(total + 2);
  const opts = shuffle([correct, d1, d2, d3].filter(v => parseInt(v) > 0), rng);
  // Ensure we have 4 options
  while (opts.length < 4) opts.push(String(total + opts.length + 1));

  return {
    id: `cbc-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['visual','conteo-cubos'],
    question: 'Cuantos cubos componen la figura? (Considere que todos los bloques existen aunque no se vean)',
    options: opts.slice(0, 4), answer: opts.indexOf(correct), explanation: `Total de cubos: ${total}.`,
    visualType: 'conteo-cubos', visualData: { heights, cols, rows },
  };
}

// ============================================================
// 31. APTITUD NUMERICA (text - UVE various)
// Arithmetic, percentages, fractions, Roman numerals, unit conversions
// ============================================================
function generateAptitudNumericaQuestion(rng) {
  const type = Math.floor(rng() * 12);

  if (type === 0) {
    // Signed integer operations
    const a = Math.floor(rng() * 19) - 9, b = Math.floor(rng() * 19) - 9;
    const c = Math.floor(rng() * 19) - 9, d = Math.floor(rng() * 19) - 9;
    const ops = ['+', '-'];
    const op1 = pick(ops, rng), op2 = pick(ops, rng);
    const expr = `(${a>=0?'+':''}${a}) ${op1} (${b>=0?'+':''}${b}) ${op2} (${c>=0?'+':''}${c})`;
    const result = op1 === '+' ? (op2 === '+' ? a + b + c : a + b - c) : (op2 === '+' ? a - b + c : a - b - c);
    const correct = String(result);
    const dists = [result + 1, result - 1, result + 2].map(String).filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['aritmetica'], question: `Resuelva: ${expr}`, options: opts, answer: opts.indexOf(correct), explanation: `${expr} = ${result}` };
  } else if (type === 1) {
    // Percentage of a number
    const pct = pick([10, 15, 20, 25, 30, 40, 50, 75, 80], rng);
    const base = pick([20, 40, 50, 80, 100, 200, 500, 1000], rng);
    const result = (pct / 100) * base;
    const correct = result % 1 === 0 ? String(result) : result.toFixed(2);
    const dists = [result * 2, result / 2, result + base * 0.1].map(v => v % 1 === 0 ? String(v) : v.toFixed(2)).filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['porcentajes'], question: `El ${pct}% de ${base} es:`, options: opts, answer: opts.indexOf(correct), explanation: `${pct}% de ${base} = ${correct}` };
  } else if (type === 2) {
    // Fraction addition
    const a = 1 + Math.floor(rng() * 7), b = 2 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 7), d = 2 + Math.floor(rng() * 6);
    const num = a * d + c * b, den = b * d;
    const g = gcd(Math.abs(num), Math.abs(den));
    const rn = num / g, rd = den / g;
    const correct = rd === 1 ? String(rn) : `${rn}/${rd}`;
    const dists = [`${rn+1}/${rd}`, `${rn}/${rd+1}`, `${rn-1}/${rd}`].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['fracciones'], question: `Resuelva: ${a}/${b} + ${c}/${d}`, options: opts, answer: opts.indexOf(correct), explanation: `${a}/${b} + ${c}/${d} = ${correct}` };
  } else if (type === 3) {
    // Roman numerals: number to roman
    const n = 10 + Math.floor(rng() * 3990);
    const roman = toRoman(n);
    const correct = roman;
    const dists = [toRoman(n + 10), toRoman(Math.max(1, n - 10)), toRoman(n + 100)].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['numeros-romanos'], question: `${n.toLocaleString('es-ES')} en numeros romanos es:`, options: opts, answer: opts.indexOf(correct), explanation: `${n} = ${roman}` };
  } else if (type === 4) {
    // Unit conversion
    const conversions = [
      { q: 'Cuantos milimetros hay en un kilometro?', a: '1.000.000', d: ['100.000', '10.000', '1.000'] },
      { q: 'Cuantos centimetros hay en 3 metros?', a: '300', d: ['30', '3.000', '3'] },
      { q: 'Cuantos gramos hay en 2,5 kilogramos?', a: '2.500', d: ['250', '25.000', '25'] },
      { q: 'Cuantos segundos hay en 2 horas?', a: '7.200', d: ['3.600', '720', '72.000'] },
      { q: 'Cuantos metros hay en 5 kilometros?', a: '5.000', d: ['500', '50.000', '50'] },
      { q: 'Cuantos litros hay en 3.500 mililitros?', a: '3,5', d: ['35', '0,35', '350'] },
      { q: 'Cuantos minutos hay en un dia?', a: '1.440', d: ['1.200', '1.080', '720'] },
    ];
    const conv = pick(conversions, rng);
    const opts = shuffle([conv.a, ...conv.d], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['conversiones'], question: conv.q, options: opts, answer: opts.indexOf(conv.a), explanation: `Respuesta: ${conv.a}` };
  } else if (type === 5) {
    // Multiplication with decimals
    const a = (1 + Math.floor(rng() * 99)) / 10;
    const b = (1 + Math.floor(rng() * 99)) / 10;
    const result = Math.round(a * b * 100) / 100;
    const correct = result.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 2});
    const dists = [(result * 10).toLocaleString('es-ES'), (result / 10).toLocaleString('es-ES'), (result + 0.1).toLocaleString('es-ES')].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['decimales'], question: `${a.toLocaleString('es-ES')} x ${b.toLocaleString('es-ES')} =`, options: opts, answer: opts.indexOf(correct), explanation: `${a} x ${b} = ${correct}` };
  } else if (type === 6) {
    // What percentage is A of B?
    const b = pick([20, 25, 40, 50, 80, 100, 200, 250], rng);
    const pct = pick([5, 10, 20, 25, 30, 40, 50, 75], rng);
    const a = b * pct / 100;
    const correct = `${pct}%`;
    const dists = [`${pct + 5}%`, `${pct - 5 > 0 ? pct - 5 : pct + 10}%`, `${pct * 2}%`].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['porcentajes'], question: `Que tanto por ciento de ${b} es ${a}?`, options: opts, answer: opts.indexOf(correct), explanation: `${a}/${b} = ${pct}%` };
  } else if (type === 7) {
    // Simple word problem
    const problems = [
      { q: 'Una caja pesa 36 kg. Vacia pesa 2 kg. Cuanto pesa su contenido?', a: '34', d: ['30', '38', '32'] },
      { q: 'Si 3 chicles cuestan 15 centimos, cuanto costaran 20?', a: '1 euro', d: ['75 centimos', '1 euro y 25 centimos', '80 centimos'] },
      { q: 'Un tren recorre 120 km en 2 horas. Cual es su velocidad media?', a: '60 km/h', d: ['80 km/h', '40 km/h', '120 km/h'] },
      { q: 'Si compro 5 manzanas a 0,60 euros cada una, cuanto pago?', a: '3 euros', d: ['3,50 euros', '2,50 euros', '3,60 euros'] },
      { q: 'Un deposito tiene 500 litros. Se gastan 3/5 partes. Cuanto queda?', a: '200 litros', d: ['300 litros', '100 litros', '250 litros'] },
    ];
    const prob = pick(problems, rng);
    const opts = shuffle([prob.a, ...prob.d], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['problemas'], question: prob.q, options: opts, answer: opts.indexOf(prob.a), explanation: `Respuesta: ${prob.a}` };
  } else if (type === 8) {
    // Division
    const b = 2 + Math.floor(rng() * 12);
    const result = 2 + Math.floor(rng() * 50);
    const a = b * result;
    const correct = String(result);
    const dists = [result + 1, result - 1, result * 2].map(String).filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['aritmetica'], question: `${a} / ${b} =`, options: opts, answer: opts.indexOf(correct), explanation: `${a} / ${b} = ${result}` };
  } else if (type === 9) {
    // Ratio: 60:0.001
    const a = pick([10, 20, 30, 60, 100, 1000], rng);
    const b = pick([0.001, 0.01, 0.1, 0.5], rng);
    const result = a / b;
    const correct = result.toLocaleString('es-ES');
    const dists = [(result * 10).toLocaleString('es-ES'), (result / 10).toLocaleString('es-ES'), (result / 100).toLocaleString('es-ES')].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['aritmetica'], question: `${a.toLocaleString('es-ES')} : ${b.toLocaleString('es-ES')} =`, options: opts, answer: opts.indexOf(correct), explanation: `${a} / ${b} = ${correct}` };
  } else if (type === 10) {
    // Time arithmetic
    const h = 2 + Math.floor(rng() * 10);
    const m = Math.floor(rng() * 4) * 10 + 10;
    const addM = 50 + Math.floor(rng() * 200);
    const totalM = h * 60 + m + addM;
    const rh = Math.floor(totalM / 60), rm = totalM % 60;
    const correct = `${rh} horas y ${rm} minutos`;
    const dists = [`${rh + 1} horas y ${rm} minutos`, `${rh} horas y ${(rm + 10) % 60} minutos`, `${rh - 1} horas y ${rm} minutos`].filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['tiempo'], question: `${h} horas ${m} minutos + ${addM} minutos =`, options: opts, answer: opts.indexOf(correct), explanation: `Total: ${correct}` };
  } else {
    // Signed multiplication
    const a = (Math.floor(rng() * 12) - 6);
    const b = (Math.floor(rng() * 12) - 6);
    const c = (Math.floor(rng() * 8) - 4);
    const result = a * b * (c || 1);
    const expr = `(${a>=0?'+':''}${a}) x (${b>=0?'+':''}${b})${c !== 1 ? ` x (${c>=0?'+':''}${c})` : ''}`;
    const correct = String(result);
    const dists = [result + 2, -result, result - 5].map(String).filter(d => d !== correct);
    const opts = shuffle([correct, ...dists.slice(0, 3)], rng);
    return { id: `apn-${Math.floor(rng()*1e6)}`, category: 'aptitud-numerica', tags: ['aritmetica'], question: `Resuelva: ${expr}`, options: opts, answer: opts.indexOf(correct), explanation: `${expr} = ${result}` };
  }
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { r += syms[i]; n -= vals[i]; } }
  return r;
}

// ============================================================
// 32. LETTER-VALUE ALGEBRA (Razonamiento Abstracto 2)
// Letters assigned numeric values, evaluate expressions
// ============================================================
function generateLetterValueAlgebraQuestion(rng) {
  // Assign values to 5-6 letters
  const letters = ['M', 'N', 'S', 'P', 'O', 'R'];
  const values = [1, 2, 3, 4, 5, 6];

  // Shuffle the assignment
  const shuffled = shuffle([...values], rng);
  const assignment = {};
  for (let i = 0; i < letters.length; i++) assignment[letters[i]] = shuffled[i];

  // Generate an expression
  const ops = ['+', '-', 'x'];

  function evalExpr(parts) {
    // Simple left-to-right evaluation respecting x priority
    let tokens = [];
    for (const p of parts) {
      if (typeof p === 'string' && assignment[p] !== undefined) tokens.push(assignment[p]);
      else if (typeof p === 'number') tokens.push(p);
      else tokens.push(p);
    }
    // Handle multiplication first
    let i = 0;
    while (i < tokens.length) {
      if (tokens[i] === 'x') {
        const result = tokens[i-1] * tokens[i+1];
        tokens.splice(i-1, 3, result);
      } else i++;
    }
    // Then addition/subtraction
    let result = tokens[0];
    for (let j = 1; j < tokens.length; j += 2) {
      if (tokens[j] === '+') result += tokens[j+1];
      else if (tokens[j] === '-') result -= tokens[j+1];
    }
    return result;
  }

  // Generate left side expression
  const l1 = pick(letters, rng), l2 = pick(letters.filter(l => l !== l1), rng);
  const l3 = pick(letters, rng);
  const op1 = pick(ops, rng), op2 = pick(ops, rng);

  const leftParts = [l1, op1, l2, op2, l3];
  const leftValue = evalExpr(leftParts);
  const leftStr = `(${l1} ${op1} ${l2}) ${op2} ${l3}`;

  // Generate 4 candidate right expressions, one with same value
  function makeExpr(rng2) {
    const a = pick(letters, rng2), b = pick(letters, rng2);
    const o = pick(ops, rng2);
    return { parts: [a, o, b], str: `(${a} ${o} ${b})` };
  }

  const correct = { str: '', val: leftValue };
  // Find a matching expression by trying combinations
  let correctStr = '';
  for (let attempt = 0; attempt < 200; attempt++) {
    const e = makeExpr(rng);
    const val = evalExpr(e.parts);
    if (val === leftValue) { correctStr = e.str; break; }
  }
  if (!correctStr) correctStr = String(leftValue); // fallback to just the number

  // Generate distractors
  const allOpts = [correctStr];
  for (let attempt = 0; attempt < 200 && allOpts.length < 4; attempt++) {
    const e = makeExpr(rng);
    const val = evalExpr(e.parts);
    if (val !== leftValue && !allOpts.includes(e.str)) allOpts.push(e.str);
  }
  while (allOpts.length < 4) allOpts.push(String(leftValue + allOpts.length));

  const opts = shuffle(allOpts, rng);
  const assignStr = letters.map(l => `${l}=${assignment[l]}`).join(', ');

  return {
    id: `lva-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['algebra-letras'],
    question: `Si ${assignStr}. Cual de las opciones es igual a ${leftStr}?`,
    options: opts, answer: opts.indexOf(correctStr),
    explanation: `${leftStr} = ${leftValue}. ${correctStr} = ${leftValue}.`,
  };
}

// ============================================================
// 33. LETTER SERIES (text - UVE Series de Letras)
// Find the next letter in a sequence
// ============================================================
function generateLetterSeriesQuestion(rng) {
  // Spanish alphabet without w (as per UVE rules) and without ñ for simplicity
  const ALPHA = 'abcdefghijklmnopqrstuvxyz';
  const patternType = Math.floor(rng() * 8);
  let series, answer, explanation;

  if (patternType === 0) {
    // Simple +1: consecutive letters
    const start = Math.floor(rng() * 18);
    series = [];
    for (let i = 0; i < 6; i++) series.push(ALPHA[(start + i) % ALPHA.length]);
    answer = ALPHA[(start + 6) % ALPHA.length];
    explanation = `Serie consecutiva: cada letra avanza +1 posicion`;
  } else if (patternType === 1) {
    // Skip +2
    const start = Math.floor(rng() * 18);
    series = [];
    for (let i = 0; i < 5; i++) series.push(ALPHA[(start + i * 2) % ALPHA.length]);
    answer = ALPHA[(start + 10) % ALPHA.length];
    explanation = `Serie con salto de 2: cada letra avanza +2 posiciones`;
  } else if (patternType === 2) {
    // Two interleaved sequences each +1
    const s1 = Math.floor(rng() * 15), s2 = Math.floor(rng() * 15);
    if (s1 === s2) return generateLetterSeriesQuestion(rng);
    series = [];
    for (let i = 0; i < 3; i++) { series.push(ALPHA[(s1 + i) % ALPHA.length]); series.push(ALPHA[(s2 + i) % ALPHA.length]); }
    answer = ALPHA[(s1 + 3) % ALPHA.length];
    explanation = `Dos series intercaladas: ${ALPHA[s1%ALPHA.length]},${ALPHA[(s1+1)%ALPHA.length]},${ALPHA[(s1+2)%ALPHA.length]}... y ${ALPHA[s2%ALPHA.length]},${ALPHA[(s2+1)%ALPHA.length]},${ALPHA[(s2+2)%ALPHA.length]}...`;
  } else if (patternType === 3) {
    // Reverse: z, y, x, w, ...
    const start = 15 + Math.floor(rng() * 8);
    series = [];
    for (let i = 0; i < 6; i++) series.push(ALPHA[(start - i + ALPHA.length) % ALPHA.length]);
    answer = ALPHA[(start - 6 + ALPHA.length) % ALPHA.length];
    explanation = `Serie descendente: cada letra retrocede -1`;
  } else if (patternType === 4) {
    // Groups of 3: abc, def, ghi → j
    const start = Math.floor(rng() * 12);
    series = [];
    for (let g = 0; g < 3; g++) for (let i = 0; i < 3; i++) series.push(ALPHA[(start + g * 3 + i) % ALPHA.length]);
    answer = ALPHA[(start + 9) % ALPHA.length];
    explanation = `Grupos de 3 letras consecutivas`;
  } else if (patternType === 5) {
    // Increasing skip: +1, +2, +3, +4...
    const start = Math.floor(rng() * 10);
    series = [ALPHA[start % ALPHA.length]];
    let pos = start;
    for (let skip = 1; skip <= 4; skip++) { pos += skip; series.push(ALPHA[pos % ALPHA.length]); }
    pos += 5;
    answer = ALPHA[pos % ALPHA.length];
    explanation = `Saltos crecientes: +1, +2, +3, +4, +5`;
  } else if (patternType === 6) {
    // Repeated pairs: a,a,b,b,c,c → d
    const start = Math.floor(rng() * 18);
    series = [];
    for (let i = 0; i < 3; i++) { series.push(ALPHA[(start + i) % ALPHA.length]); series.push(ALPHA[(start + i) % ALPHA.length]); }
    answer = ALPHA[(start + 3) % ALPHA.length];
    explanation = `Pares repetidos: cada letra aparece dos veces`;
  } else {
    // Skip +3
    const start = Math.floor(rng() * 15);
    series = [];
    for (let i = 0; i < 5; i++) series.push(ALPHA[(start + i * 3) % ALPHA.length]);
    answer = ALPHA[(start + 15) % ALPHA.length];
    explanation = `Serie con salto de 3`;
  }

  const seriesStr = series.join(', ') + ', ?';
  const dists = new Set([answer]);
  while (dists.size < 4) dists.add(ALPHA[Math.floor(rng() * ALPHA.length)]);
  const opts = shuffle([...dists], rng);

  return {
    id: `ls-${Math.floor(rng()*1e6)}`, category: 'razonamiento-abstracto',
    tags: ['series-letras'],
    question: `Que letra continua la serie: ${seriesStr}`,
    options: opts, answer: opts.indexOf(answer),
    explanation,
  };
}

// ============================================================
// 34. NUMBER SERIES (text - UVE Series de Números)
// Find the next number in a sequence
// ============================================================
function generateNumberSeriesQuestion(rng) {
  const patternType = Math.floor(rng() * 10);
  let series, answer, explanation;

  if (patternType === 0) {
    // Arithmetic +d
    const d = pick([2, 3, 4, 5, 7], rng);
    const start = 1 + Math.floor(rng() * 10);
    series = [];
    for (let i = 0; i < 6; i++) series.push(start + i * d);
    answer = start + 6 * d;
    explanation = `Serie aritmetica: +${d}`;
  } else if (patternType === 1) {
    // Geometric x2 or x3
    const mult = pick([2, 3], rng);
    const start = 1 + Math.floor(rng() * 4);
    series = [];
    let v = start;
    for (let i = 0; i < 5; i++) { series.push(v); v *= mult; }
    answer = v;
    explanation = `Serie geometrica: x${mult}`;
  } else if (patternType === 2) {
    // Fibonacci-like
    const a = 1 + Math.floor(rng() * 5), b = 1 + Math.floor(rng() * 5);
    series = [a, b];
    for (let i = 2; i < 6; i++) series.push(series[i - 1] + series[i - 2]);
    answer = series[series.length - 1] + series[series.length - 2];
    explanation = `Cada numero es la suma de los dos anteriores`;
  } else if (patternType === 3) {
    // Alternating +a, -b
    const a = pick([3, 4, 5, 6], rng), b = pick([1, 2], rng);
    const start = 1 + Math.floor(rng() * 10);
    series = [start];
    for (let i = 1; i < 6; i++) series.push(series[i - 1] + (i % 2 === 1 ? a : -b));
    answer = series[series.length - 1] + (6 % 2 === 1 ? a : -b);
    explanation = `Patron alternante: +${a}, -${b}`;
  } else if (patternType === 4) {
    // Squares
    const start = 1 + Math.floor(rng() * 4);
    series = [];
    for (let i = start; i < start + 5; i++) series.push(i * i);
    answer = (start + 5) * (start + 5);
    explanation = `Cuadrados perfectos: ${start + 5}^2 = ${answer}`;
  } else if (patternType === 5) {
    // Decreasing arithmetic
    const d = pick([2, 3, 4, 5], rng);
    const start = 50 + Math.floor(rng() * 30);
    series = [];
    for (let i = 0; i < 6; i++) series.push(start - i * d);
    answer = start - 6 * d;
    explanation = `Serie descendente: -${d}`;
  } else if (patternType === 6) {
    // Two interleaved arithmetic sequences
    const d1 = pick([2, 3], rng), d2 = pick([1, 4, 5], rng);
    const s1 = 1 + Math.floor(rng() * 10), s2 = 10 + Math.floor(rng() * 10);
    series = [];
    for (let i = 0; i < 3; i++) { series.push(s1 + i * d1); series.push(s2 + i * d2); }
    answer = s1 + 3 * d1;
    explanation = `Dos series intercaladas: una +${d1} y otra +${d2}`;
  } else if (patternType === 7) {
    // Increasing differences: +1, +2, +3, +4...
    const start = 1 + Math.floor(rng() * 8);
    series = [start];
    for (let d = 1; d <= 5; d++) series.push(series[series.length - 1] + d);
    answer = series[series.length - 1] + 6;
    explanation = `Diferencias crecientes: +1, +2, +3, +4, +5, +6`;
  } else if (patternType === 8) {
    // Powers of 2
    const start = Math.floor(rng() * 3);
    series = [];
    for (let i = start; i < start + 6; i++) series.push(Math.pow(2, i));
    answer = Math.pow(2, start + 6);
    explanation = `Potencias de 2`;
  } else {
    // Primes
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    const start = Math.floor(rng() * 6);
    series = primes.slice(start, start + 6);
    answer = primes[start + 6];
    explanation = `Numeros primos consecutivos`;
  }

  const correct = String(answer);
  const dists = new Set([correct]);
  while (dists.size < 4) {
    const off = pick([-2, -1, 1, 2, 3, -3], rng);
    dists.add(String(answer + off));
  }
  const opts = shuffle([...dists], rng);
  const seriesStr = series.join(', ') + ', ?';

  return {
    id: `ns-${Math.floor(rng()*1e6)}`, category: 'razonamiento-numerico',
    tags: ['series-numeros'],
    question: `Que numero continua la serie: ${seriesStr}`,
    options: opts, answer: opts.indexOf(correct),
    explanation,
  };
}

// ============================================================
// 35. WRONG NUMBER IN SERIES (text - UVE Series de Números 7)
// Find the number that doesn't belong
// ============================================================
function generateWrongNumberQuestion(rng) {
  const patternType = Math.floor(rng() * 5);
  let series, wrongIdx, correctVal, explanation;

  if (patternType === 0) {
    // Arithmetic
    const d = pick([2, 3, 4, 5, 7], rng);
    const start = 1 + Math.floor(rng() * 15);
    series = [];
    for (let i = 0; i < 7; i++) series.push(start + i * d);
    wrongIdx = 2 + Math.floor(rng() * 4);
    correctVal = series[wrongIdx];
    series[wrongIdx] += pick([-1, 1, -2, 2], rng);
    explanation = `Serie aritmetica +${d}. El valor correcto en posicion ${wrongIdx + 1} es ${correctVal}`;
  } else if (patternType === 1) {
    // Geometric
    const mult = pick([2, 3], rng);
    const start = 1 + Math.floor(rng() * 5);
    series = [];
    let v = start;
    for (let i = 0; i < 6; i++) { series.push(v); v *= mult; }
    wrongIdx = 2 + Math.floor(rng() * 3);
    correctVal = series[wrongIdx];
    series[wrongIdx] += pick([-1, 1, 2, -2], rng);
    explanation = `Serie geometrica x${mult}. El valor correcto es ${correctVal}`;
  } else if (patternType === 2) {
    // Squares
    const start = 1 + Math.floor(rng() * 5);
    series = [];
    for (let i = start; i < start + 7; i++) series.push(i * i);
    wrongIdx = 2 + Math.floor(rng() * 4);
    correctVal = series[wrongIdx];
    series[wrongIdx] += pick([-1, 1, 3, -3], rng);
    explanation = `Cuadrados perfectos. El valor correcto es ${correctVal}`;
  } else if (patternType === 3) {
    // Fibonacci
    series = [1 + Math.floor(rng() * 3), 2 + Math.floor(rng() * 4)];
    for (let i = 2; i < 7; i++) series.push(series[i - 1] + series[i - 2]);
    wrongIdx = 3 + Math.floor(rng() * 3);
    correctVal = series[wrongIdx];
    series[wrongIdx] += pick([-1, 1, 2], rng);
    explanation = `Cada numero es la suma de los dos anteriores. El valor correcto es ${correctVal}`;
  } else {
    // Increasing differences
    const start = 1 + Math.floor(rng() * 5);
    series = [start];
    for (let d = 1; d <= 6; d++) series.push(series[series.length - 1] + d);
    wrongIdx = 2 + Math.floor(rng() * 4);
    correctVal = series[wrongIdx];
    series[wrongIdx] += pick([-1, 1, 2], rng);
    explanation = `Diferencias crecientes +1,+2,+3... El valor correcto es ${correctVal}`;
  }

  const correct = String(correctVal);
  const wrong = String(series[wrongIdx]);
  // Options are: the correct replacement value
  const dists = new Set([correct]);
  while (dists.size < 4) {
    const off = pick([-2, -1, 1, 2, 3], rng);
    dists.add(String(correctVal + off));
  }
  const opts = shuffle([...dists], rng);

  return {
    id: `wn-${Math.floor(rng()*1e6)}`, category: 'razonamiento-numerico',
    tags: ['numero-erroneo'],
    question: `En la serie ${series.join(', ')} hay un numero equivocado (${wrong}). Cual deberia ser?`,
    options: opts, answer: opts.indexOf(correct),
    explanation,
  };
}

// ============================================================
// 36. SYNONYMS (text - UVE Sinónimos)
// ============================================================
function generateSynonymQuestion(rng) {
  const PAIRS = [
    ['Arredrar','Intimidar'],['Rudimento','Empuje'],['Epitome','Compendio'],
    ['Monocromo','Unicolor'],['Hiel','Bilis'],['Mohino','Triste'],
    ['Epilogo','Conclusion'],['Empecer','Impedir'],['Morigerado','Moderado'],
    ['Fustigar','Azotar'],['Zafio','Tosco'],['Fulgente','Brillante'],
    ['Vortice','Torbellino'],['Zambra','Algazara'],['Aducir','Alegar'],
    ['Adiposo','Graso'],['Cata','Prueba'],['Casual','Fortuito'],
    ['Belitre','Picara'],['Equipolente','Equivalente'],['Despota','Autocrata'],
    ['Boyante','Acomodado'],['Condonar','Perdonar'],['Estigma','Marca'],
    ['Dilacion','Demora'],['Lenitivo','Calmante'],['Congruencia','Adecuacion'],
    ['Disentir','Discrepar'],['Leva','Recluta'],['Epístola','Carta'],
    ['Lego','Seglar'],['Espuela','Acicate'],['Ondear','Ondular'],
    ['Latrocinio','Hurto'],['Mazorca','Maiz'],['Obituario','Necrologia'],
    ['Suspicaz','Confiado'],['Enajenar','Transferencia'],['Clausurar','Inaugurar'],
    ['Claudicar','Ceder'],['Indeleble','Imborrable'],['Aciago','Malvado'],
    ['Hacinar','Halagar'],['Hender','Abrir'],['Himeneo','Nupcias'],
    ['Atonia','Tension'],['Jiron','Harapo'],['Mella','Menoscabo'],
    ['Hilarante','Gracioso'],['Propenso','Inclinado'],['Mefitico','Fetido'],
    ['Perorar','Hablar'],['Hiperbole','Exageracion'],['Loor','Honor'],
    ['Acerbidad','Crueldad'],['Nimio','Importante'],['Infecto','Lastrado'],
    ['Adjetivar','Calificar'],['Gatuperio','Embrollo'],
  ];

  const idx = Math.floor(rng() * PAIRS.length);
  const [word, correct] = PAIRS[idx];

  // Build distractors from other answers
  const dists = new Set([correct]);
  let s = 0;
  while (dists.size < 4 && s < 100) {
    s++;
    const other = PAIRS[Math.floor(rng() * PAIRS.length)];
    if (other[1] !== correct && !dists.has(other[1])) dists.add(other[1]);
  }
  // Fallback
  while (dists.size < 4) dists.add(PAIRS[dists.size][1]);
  const opts = shuffle([...dists], rng);

  return {
    id: `syn-${Math.floor(rng()*1e6)}`, category: 'razonamiento-verbal',
    tags: ['sinonimos'],
    question: `Senale el sinonimo de "${word}":`,
    options: opts, answer: opts.indexOf(correct),
    explanation: `${word} = ${correct}`,
  };
}

// ============================================================
// 37. ANTONYMS (text - UVE Antónimos)
// ============================================================
function generateAntonymQuestion(rng) {
  const PAIRS = [
    ['Nimio','Importante'],['Loor','Critica'],['Acerbidad','Bondad'],
    ['Suspicaz','Confiado'],['Enajenar','Adquirir'],['Clausurar','Inaugurar'],
    ['Claudicar','Resistir'],['Indeleble','Borrable'],['Aciago','Feliz'],
    ['Hacinar','Diseminar'],['Hender','Cerrar'],['Himeneo','Separacion'],
    ['Atonia','Tension'],['Jiron','Unidad'],['Mella','Aumento'],
    ['Hilarante','Triste'],['Propenso','Adverso'],['Mefitico','Saludable'],
    ['Perorar','Callar'],['Hiperbole','Moderacion'],['Veloz','Lento'],
    ['Opulento','Pobre'],['Exiguo','Abundante'],['Prolijo','Conciso'],
    ['Nocturno','Diurno'],['Efimero','Eterno'],['Arduo','Facil'],
    ['Benevolente','Cruel'],['Lucido','Confuso'],['Proclive','Reacio'],
    ['Austero','Lujoso'],['Loable','Censurable'],['Diligente','Negligente'],
    ['Tacito','Explicito'],['Parco','Prodigo'],['Veraz','Mendaz'],
    ['Somero','Profundo'],['Falaz','Honesto'],['Tenaz','Inconstante'],
    ['Apto','Inepto'],['Fertil','Esteril'],['Sobrio','Ebrio'],
    ['Cauteloso','Imprudente'],['Docil','Rebelde'],['Fugaz','Duradero'],
    ['Profuso','Escaso'],['Ignoto','Conocido'],['Benevolo','Malvado'],
    ['Inicuo','Justo'],['Diafano','Opaco'],
  ];

  const idx = Math.floor(rng() * PAIRS.length);
  const [word, correct] = PAIRS[idx];

  const dists = new Set([correct]);
  let s = 0;
  while (dists.size < 4 && s < 100) {
    s++;
    const other = PAIRS[Math.floor(rng() * PAIRS.length)];
    if (other[1] !== correct && !dists.has(other[1])) dists.add(other[1]);
  }
  while (dists.size < 4) dists.add(PAIRS[dists.size][1]);
  const opts = shuffle([...dists], rng);

  return {
    id: `ant-${Math.floor(rng()*1e6)}`, category: 'razonamiento-verbal',
    tags: ['antonimos'],
    question: `Senale el antonimo de "${word}":`,
    options: opts, answer: opts.indexOf(correct),
    explanation: `Antonimo de ${word} = ${correct}`,
  };
}

// ============================================================
// 38. VERBAL ANALOGIES (text - UVE Razonamiento Verbal 2)
// "A is to B as C is to ?"
// ============================================================
function generateAnalogyQuestion(rng) {
  const ANALOGIES = [
    ['CALAMAR','MAR','CAMALEON','Selva',['Selva','Color','Reptil','Tinta']],
    ['DISTANCIA','KILOMETRO','PESO','Bascula',['Bascula','Volumen','Peso','Gordo']],
    ['ACTRIZ','PELICULA','CANTANTE','Cancion',['Serie','Cancion','Opera','Escenario']],
    ['AGUA','INUNDAR','FUEGO','Quemar',['Beber','Bosque','Quemar','Calentar']],
    ['TIGRE','SELVA','VEGETAL','Cultivo',['Cultivo','Carne','Selva','Herbivoro']],
    ['INTERES','PRESTAMO','RENTA','Alquiler',['Casa','Capital','Alquiler','Dinero']],
    ['PRINCIPIO','PROLOGO','EPILOGO','Fin',['Fin','Conclusion','Prologo','Preambulo']],
    ['SIMON','MAR','TIFON','Desierto',['Desierto','Sabana','Bosque','Mar']],
    ['BERREAR','BECERRO','BALAR','Oveja',['Vaca','Cabra','Oveja','Gamo']],
    ['VACA','MUGIR','CIERVO','Bramar',['Berrear','Bramar','Balar','Graznido']],
    ['DECAPITAR','GUILLOTINA','AHORCAR','Soga',['Soga','Guillotinar','Hacha','Ajusticiar']],
    ['NUERA','SUEGRA','YERNO','Suegro',['Suegro','Madre','Nuero','Yerno']],
    ['TERNERO','VACA','JABATO','Jabali',['Mulo','Burro','Jabali','Bramar']],
    ['MAR','CALAMAR','TIERRA','Avion',['Aire','Avion','Charco','Escopeta']],
    ['OJO','VER','OIDO','Oir',['Oir','Hablar','Tocar','Oler']],
    ['PADRE','HIJO','ABUELO','Nieto',['Nieto','Padre','Tio','Sobrino']],
    ['LUNES','MARTES','MIERCOLES','Jueves',['Jueves','Viernes','Sabado','Domingo']],
    ['PRIMAVERA','VERANO','OTONO','Invierno',['Invierno','Frio','Nieve','Diciembre']],
    ['DEDO','MANO','MANO','Brazo',['Pie','Brazo','Muneca','Codo']],
    ['COCHE','CARRETERA','BARCO','Mar',['Puerto','Mar','Rio','Agua']],
    ['PINTOR','CUADRO','ESCRITOR','Libro',['Libro','Poema','Pluma','Papel']],
    ['PULMONES','RESPIRAR','ESTOMAGO','Digerir',['Comer','Digerir','Tragar','Beber']],
    ['SEMILLA','ARBOL','HUEVO','Ave',['Gallina','Ave','Nido','Pluma']],
    ['OVEJA','REBANO','ABEJA','Enjambre',['Colmena','Enjambre','Miel','Panal']],
    ['ALUMNO','ESCUELA','ENFERMO','Hospital',['Medico','Hospital','Clinica','Cama']],
    ['HIELO','AGUA','VAPOR','Agua',['Nube','Agua','Calor','Gas']],
    ['ESPANA','MADRID','FRANCIA','Paris',['Lyon','Paris','Europa','Marsella']],
    ['VIOLIN','CUERDA','FLAUTA','Viento',['Madera','Viento','Soplar','Metal']],
    ['HAMBRE','COMER','SED','Beber',['Agua','Beber','Tragar','Zumo']],
    ['MEDICO','HOSPITAL','PROFESOR','Colegio',['Colegio','Clase','Alumno','Pizarra']],
  ];

  const idx = Math.floor(rng() * ANALOGIES.length);
  const [a, b, c, correct, pool] = ANALOGIES[idx];

  const opts = shuffle([...pool], rng);

  return {
    id: `ana-${Math.floor(rng()*1e6)}`, category: 'razonamiento-verbal',
    tags: ['analogias'],
    question: `${a} es a ${b} como ${c} es a ...`,
    options: opts, answer: opts.indexOf(correct),
    explanation: `${a}:${b} = ${c}:${correct}`,
  };
}

// ============================================================
// PALABRA DIFERENTE (UVE Factor Verbal Q1-4)
// ============================================================
function generatePalabraDiferenteQuestion(rng) {
  const groups = [
    { label: 'antiguo', words: ['Vetusto', 'Añejo', 'Ancestral', 'Arcaico', 'Anticuado', 'Longevo', 'Vetero'] },
    { label: 'misterioso', words: ['Arcano', 'Enigmático', 'Críptico', 'Hermético', 'Insondable', 'Recóndito', 'Ignoto'] },
    { label: 'astuto', words: ['Sagaz', 'Perspicaz', 'Agudo', 'Avispado', 'Ladino', 'Taimado', 'Suspicaz'] },
    { label: 'sereno', words: ['Flemático', 'Impasible', 'Estoico', 'Imperturbable', 'Ecuánime', 'Circunspecto'] },
    { label: 'pelea', words: ['Gresca', 'Riña', 'Pugilato', 'Pendencia', 'Altercado', 'Reyerta', 'Trifulca'] },
    { label: 'ofensa', words: ['Injuria', 'Ultraje', 'Agravio', 'Afrenta', 'Baldón', 'Improperio', 'Oprobio'] },
    { label: 'generoso', words: ['Dadivoso', 'Magnánimo', 'Espléndido', 'Munificente', 'Desprendido', 'Pródigo'] },
    { label: 'valiente', words: ['Intrépido', 'Audaz', 'Osado', 'Valeroso', 'Denodado', 'Aguerrido'] },
    { label: 'triste', words: ['Melancólico', 'Apesadumbrado', 'Afligido', 'Taciturno', 'Compungido', 'Acongojado'] },
    { label: 'hermoso', words: ['Bello', 'Agraciado', 'Apuesto', 'Gallardo', 'Esbelto', 'Garboso'] },
    { label: 'grande', words: ['Enorme', 'Inmenso', 'Colosal', 'Descomunal', 'Gigantesco', 'Monumental'] },
    { label: 'pequeño', words: ['Diminuto', 'Minúsculo', 'Exiguo', 'Menudo', 'Liliputiense', 'Microscópico'] },
    { label: 'rápido', words: ['Veloz', 'Raudo', 'Presto', 'Ligero', 'Presuroso', 'Célere'] },
    { label: 'lento', words: ['Pausado', 'Moroso', 'Parsimonioso', 'Calmoso', 'Tardo', 'Cachazudo'] },
    { label: 'sincero', words: ['Franco', 'Honesto', 'Veraz', 'Leal', 'Fidedigno', 'Probo'] },
    { label: 'mentiroso', words: ['Embustero', 'Falaz', 'Mendaz', 'Impostor', 'Farsante', 'Perjuro'] },
    { label: 'miedo', words: ['Temor', 'Pavor', 'Espanto', 'Terror', 'Pánico', 'Aprensión'] },
    { label: 'rico', words: ['Acaudalado', 'Opulento', 'Pudiente', 'Adinerado', 'Próspero', 'Acomodado'] },
    { label: 'pobre', words: ['Indigente', 'Menesteroso', 'Necesitado', 'Depauperado', 'Desvalido', 'Desamparado'] },
    { label: 'necio', words: ['Fatuo', 'Insensato', 'Sandio', 'Obtuso', 'Zoquete', 'Mentecato'] },
    { label: 'sabio', words: ['Erudito', 'Docto', 'Ilustrado', 'Versado', 'Culto', 'Instruido'] },
    { label: 'avaro', words: ['Tacaño', 'Mezquino', 'Cicatero', 'Miserable', 'Roñoso', 'Rácano'] },
    { label: 'cobarde', words: ['Pusilánime', 'Medroso', 'Timorato', 'Apocado', 'Temeroso', 'Miedoso'] },
    { label: 'orgulloso', words: ['Altivo', 'Soberbio', 'Arrogante', 'Presuntuoso', 'Engreído', 'Jactancioso'] },
    { label: 'humilde', words: ['Modesto', 'Sencillo', 'Recatado', 'Discreto', 'Llano', 'Austero'] },
    { label: 'abundante', words: ['Copioso', 'Profuso', 'Prolífico', 'Cuantioso', 'Nutrido', 'Pingüe'] },
    { label: 'escaso', words: ['Exiguo', 'Parco', 'Precario', 'Magro', 'Raquítico', 'Nimio'] },
    { label: 'obstinado', words: ['Terco', 'Tozudo', 'Pertinaz', 'Testarudo', 'Contumaz', 'Recalcitrante'] },
    { label: 'breve', words: ['Conciso', 'Lacónico', 'Sucinto', 'Escueto', 'Somero', 'Parco'] },
    { label: 'extenso', words: ['Prolijo', 'Dilatado', 'Amplio', 'Vasto', 'Holgado', 'Espacioso'] },
  ];
  const idx1 = Math.floor(rng() * groups.length);
  let idx2 = Math.floor(rng() * (groups.length - 1));
  if (idx2 >= idx1) idx2++;
  const mainGroup = groups[idx1];
  const oddGroup = groups[idx2];
  const three = pickN(mainGroup.words, 3, rng);
  const oddWord = pick(oddGroup.words, rng);
  const answerIdx = Math.floor(rng() * 4);
  const options = [...three];
  options.splice(answerIdx, 0, oddWord);
  return {
    id: `pal-dif-${options.map(w => w.slice(0,3)).join('-')}-${Math.floor(rng()*1e5)}`,
    category: 'sinonimos-antonimos',
    tags: ['palabra-diferente'],
    question: '¿Cual de las siguientes palabras tiene un significado distinto a las otras tres?',
    options,
    answer: answerIdx,
    explanation: `"${oddWord}" significa ${oddGroup.label}, mientras que las demas significan ${mainGroup.label}.`,
  };
}

// ============================================================
// DEFINICIONES (UVE Factor Verbal Q5-8)
// ============================================================
function generateDefinicionQuestion(rng) {
  const defs = [
    { word: 'Genuflexión', def: 'Acción de doblar la rodilla hacia el suelo en señal de reverencia', dist: ['Inflexión', 'Crucifixión', 'Anexión'] },
    { word: 'Calumnia', def: 'Acusación falsa hecha maliciosamente para causar daño', dist: ['Injuria', 'Ultraje', 'Agravio'] },
    { word: 'Endógeno', def: 'Que se origina o nace en el interior de un organismo', dist: ['Exógeno', 'Homogéneo', 'Patógeno'] },
    { word: 'Pugilato', def: 'Contienda o pelea a puñetazos entre dos o más personas', dist: ['Gresca', 'Riña', 'Pendencia'] },
    { word: 'Ecuánime', def: 'Que tiene serenidad e imparcialidad de juicio', dist: ['Magnánime', 'Unánime', 'Pusilánime'] },
    { word: 'Lacónico', def: 'Breve y conciso en la manera de expresarse', dist: ['Sardónico', 'Platónico', 'Armónico'] },
    { word: 'Mendaz', def: 'Que tiene costumbre de mentir habitualmente', dist: ['Audaz', 'Tenaz', 'Perspicaz'] },
    { word: 'Prolijo', def: 'Excesivamente largo, detallado y minucioso', dist: ['Lacónico', 'Escueto', 'Conciso'] },
    { word: 'Efímero', def: 'De corta duración, que dura muy poco tiempo', dist: ['Perenne', 'Eterno', 'Sempiterno'] },
    { word: 'Ubicuo', def: 'Que está presente en todas partes al mismo tiempo', dist: ['Ambiguo', 'Conspicuo', 'Inocuo'] },
    { word: 'Inefable', def: 'Que no se puede expresar con palabras', dist: ['Infalible', 'Inestable', 'Ineludible'] },
    { word: 'Acérrimo', def: 'Muy fuerte, tenaz e incondicional en sus convicciones', dist: ['Efímero', 'Ecuánime', 'Nimio'] },
    { word: 'Pertinaz', def: 'Que se mantiene firme y obstinado en una actitud', dist: ['Perspicaz', 'Fugaz', 'Locuaz'] },
    { word: 'Diáfano', def: 'Transparente, claro y que deja pasar la luz', dist: ['Arcano', 'Profano', 'Lejano'] },
    { word: 'Incólume', def: 'Que no ha sufrido daño ni lesión alguna', dist: ['Insalubre', 'Insoluble', 'Inerme'] },
    { word: 'Oprobio', def: 'Vergüenza, deshonra o ignominia pública', dist: ['Elogio', 'Privilegio', 'Prodigio'] },
    { word: 'Pueril', def: 'Propio de un niño o que denota poca madurez', dist: ['Senil', 'Febril', 'Viril'] },
    { word: 'Proclive', def: 'Inclinado o propenso naturalmente a algo', dist: ['Declive', 'Conclave', 'Enclave'] },
    { word: 'Apócrifo', def: 'Falso, supuesto o fingido, de autenticidad dudosa', dist: ['Prolífico', 'Magnífico', 'Específico'] },
    { word: 'Diligente', def: 'Que pone cuidado y rapidez al hacer las cosas', dist: ['Negligente', 'Indolente', 'Insolente'] },
    { word: 'Verosímil', def: 'Que tiene apariencia de ser verdadero o creíble', dist: ['Versátil', 'Volátil', 'Inverosímil'] },
    { word: 'Oneroso', def: 'Que supone una carga pesada o un gasto excesivo', dist: ['Generoso', 'Decoroso', 'Laborioso'] },
    { word: 'Acervo', def: 'Conjunto de bienes, valores o tradiciones culturales acumulados', dist: ['Acerbo', 'Acero', 'Acierto'] },
    { word: 'Panegírico', def: 'Discurso o escrito de elogio y alabanza hacia alguien', dist: ['Genérico', 'Numérico', 'Esotérico'] },
    { word: 'Recóndito', def: 'Muy escondido, reservado u oculto a la vista', dist: ['Insólito', 'Implícito', 'Explícito'] },
    { word: 'Soporífero', def: 'Que produce o causa sueño de manera intensa', dist: ['Sudorífero', 'Vocífero', 'Pestífero'] },
    { word: 'Epítome', def: 'Resumen o compendio de una obra extensa', dist: ['Epílogo', 'Epitafio', 'Epíteto'] },
    { word: 'Lascivo', def: 'Que muestra inclinación excesiva a los placeres carnales', dist: ['Nocivo', 'Abrasivo', 'Pasivo'] },
    { word: 'Atávico', def: 'Que se remonta a antepasados lejanos o costumbres primitivas', dist: ['Acústico', 'Aquático', 'Automático'] },
    { word: 'Estólido', def: 'Falto de razón, entendimiento o sensibilidad', dist: ['Sólido', 'Válido', 'Pálido'] },
  ];
  const d = pick(defs, rng);
  const answerIdx = Math.floor(rng() * 4);
  const distractors = pickN(d.dist, 3, rng);
  const options = [...distractors];
  options.splice(answerIdx, 0, d.word);
  return {
    id: `def-${d.word.slice(0,5)}-${Math.floor(rng()*1e5)}`,
    category: 'sinonimos-antonimos',
    tags: ['definicion'],
    question: `Lea la siguiente definición. ¿Qué palabra se ajusta mejor? "${d.def}"`,
    options,
    answer: answerIdx,
    explanation: `La respuesta es "${d.word}".`,
  };
}

// ============================================================
// COMPLETAR FRASE (UVE Factor Verbal Q13-15)
// ============================================================
function generateCompletarFraseQuestion(rng) {
  const templates = [
    { phrase: 'Tu madre me ha pedido que vaya _____ el periódico.', opts: ['a por', 'por', 'comprar', 'a'], a: 0, exp: '"A por" es la expresión correcta para ir a buscar algo.' },
    { phrase: 'Nunca _____ he consultado nada a ella.', opts: ['le', 'la', 'Ambas son correctas', 'Ninguna es correcta'], a: 0, exp: '"Le" es correcto como complemento indirecto.' },
    { phrase: '_____ más bebo, más sed tengo.', opts: ['Contra', 'Cuanto', 'Si', 'Ninguna es correcta'], a: 1, exp: '"Cuanto más... más..." es la estructura correcta.' },
    { phrase: 'No creo que _____ razón en este asunto.', opts: ['tengas', 'tienes', 'tendrías', 'tuvieras'], a: 0, exp: 'Tras "no creo que" se usa subjuntivo presente: "tengas".' },
    { phrase: 'Le dijo que _____ al día siguiente.', opts: ['vendría', 'vendrá', 'viene', 'viniera'], a: 0, exp: 'En estilo indirecto pasado se usa condicional: "vendría".' },
    { phrase: 'Ojalá _____ buen tiempo mañana.', opts: ['haga', 'hace', 'hará', 'hacía'], a: 0, exp: '"Ojalá" rige subjuntivo: "haga".' },
    { phrase: 'Si lo _____ antes, te habría avisado.', opts: ['hubiera sabido', 'habría sabido', 'había sabido', 'haya sabido'], a: 0, exp: 'Condicional irreal pasado: "Si + pluscuamperfecto subjuntivo".' },
    { phrase: 'El equipo jugó _____ que nunca.', opts: ['mejor', 'más mejor', 'más bien', 'lo mejor'], a: 0, exp: '"Mejor" ya es comparativo, no necesita "más".' },
    { phrase: 'Dile que _____ aquí inmediatamente.', opts: ['venga', 'viene', 'vendrá', 'viniera'], a: 0, exp: 'Mandato indirecto: "que + subjuntivo".' },
    { phrase: 'Es posible que mañana _____ .', opts: ['llueva', 'llueve', 'lloverá', 'llovía'], a: 0, exp: '"Es posible que" rige subjuntivo.' },
    { phrase: 'Me alegro de que _____ bien el examen.', opts: ['te haya ido', 'te ha ido', 'te fue', 'te irá'], a: 0, exp: '"Me alegro de que" rige subjuntivo.' },
    { phrase: 'Cuando _____ a casa, te llamaré.', opts: ['llegue', 'llego', 'llegaré', 'llegué'], a: 0, exp: '"Cuando" + futuro rige subjuntivo presente.' },
    { phrase: 'No hay nadie que _____ eso.', opts: ['sepa', 'sabe', 'sabrá', 'sabía'], a: 0, exp: 'Antecedente negativo ("nadie") rige subjuntivo.' },
    { phrase: 'Aunque _____ cansado, seguiré trabajando.', opts: ['esté', 'estoy', 'estaré', 'estuve'], a: 0, exp: '"Aunque" concesivo rige subjuntivo.' },
    { phrase: 'Te lo expliqué para que lo _____ .', opts: ['entendieras', 'entiendes', 'entenderás', 'entendías'], a: 0, exp: '"Para que" rige subjuntivo.' },
    { phrase: 'Busco a alguien que _____ inglés y francés.', opts: ['hable', 'habla', 'hablará', 'hablaba'], a: 0, exp: 'Antecedente indefinido rige subjuntivo.' },
    { phrase: 'Es importante que todos _____ puntuales.', opts: ['sean', 'son', 'serán', 'eran'], a: 0, exp: '"Es importante que" rige subjuntivo.' },
    { phrase: 'Me pidió que le _____ el libro.', opts: ['devolviera', 'devuelvo', 'devolveré', 'devolvía'], a: 0, exp: 'Petición indirecta en pasado: subjuntivo imperfecto.' },
    { phrase: 'Haré lo que _____ necesario.', opts: ['sea', 'es', 'será', 'era'], a: 0, exp: 'Relativa con antecedente indeterminado: subjuntivo.' },
    { phrase: 'No me importa que _____ tarde.', opts: ['llegues', 'llegas', 'llegarás', 'llegabas'], a: 0, exp: '"No me importa que" rige subjuntivo.' },
    { phrase: 'El niño habla como si _____ un adulto.', opts: ['fuera', 'es', 'será', 'fue'], a: 0, exp: '"Como si" siempre rige subjuntivo imperfecto.' },
    { phrase: 'Te llamaré en cuanto _____ la noticia.', opts: ['reciba', 'recibo', 'recibiré', 'recibí'], a: 0, exp: '"En cuanto" + futuro rige subjuntivo presente.' },
    { phrase: 'Tal vez _____ mañana a visitarte.', opts: ['vaya', 'voy', 'iré', 'iba'], a: 0, exp: '"Tal vez" puede regir subjuntivo para expresar duda.' },
    { phrase: 'Antes de que _____ , quiero hablar contigo.', opts: ['te vayas', 'te vas', 'te irás', 'te ibas'], a: 0, exp: '"Antes de que" siempre rige subjuntivo.' },
  ];
  const t = pick(templates, rng);
  return {
    id: `comp-frase-${t.phrase.slice(0,15).replace(/[^a-z]/gi,'')}-${Math.floor(rng()*1e5)}`,
    category: 'ortografia',
    tags: ['completar-frase'],
    question: `Completa la frase correctamente: "${t.phrase}"`,
    options: t.opts,
    answer: t.a,
    explanation: t.exp,
  };
}

// ============================================================
// VALIDATION
// ============================================================
function validateQuestion(q) {
  if (!q || !q.options || !Array.isArray(q.options)) return false;
  if (q.options.length < 2) return false;
  if (q.answer < 0 || q.answer >= q.options.length) return false;
  // Check for duplicate options (stringify for object options)
  const strs = q.options.map(o => typeof o === 'string' ? o : JSON.stringify(o));
  const unique = new Set(strs);
  if (unique.size !== strs.length) return false;
  // Check answer option is not empty
  if (!strs[q.answer] || strs[q.answer].trim() === '') return false;
  return true;
}

// ============================================================
// GENERATOR POOL (with category mapping)
// ============================================================
const VISUAL_GENERATORS = [
  generateDominoQuestion,
  generateDominoQuestion,
  generateMatrixQuestion,
  generateMatrixQuestion,
  generateMatrixQuestion,
  generateMatrixQuestion,
  generateDividedCircleQuestion,
  generateDividedCircleQuestion,
  generatePinwheelQuestion,
  generateComplexSeriesQuestion,
  generateComplexSeriesQuestion,
  generateComplexSeriesQuestion,
  generateShapeAlgebraQuestion,
  generateShapeAlgebraQuestion,
  generateShapeAlgebraQuestion,
  generateCircuitQuestion,
  generateCircuitQuestion,
  generateNumberCardQuestion,
  generateNumberCardQuestion,
  generateOddShapeQuestion,
  generateShapeCardQuestion,
  generateGridPatternQuestion,
  generateOverlayQuestion,
  generateFoldingQuestion,
  generateCountingQuestion,
  generateSymbolFrequencyQuestion,
  generateGridComparisonQuestion,
  generateClockSeriesQuestion,
  generateClockSeriesQuestion,
  generateClockSeriesQuestion,
  generateLetterGridQuestion,
  generateLetterGridQuestion,
  generateRadialSectorQuestion,
  generateRadialSectorQuestion,
  generateRadialSectorQuestion,
  generateNumberPairSeriesQuestion,
  generateNumberPairSeriesQuestion,
  generateNumberPairSeriesQuestion,
  generateSphereRotationQuestion,
  generateSphereRotationQuestion,
  generateSymbolAlphabetQuestion,
  generateSymbolAlphabetQuestion,
  generateChartQuestion,
  generateChartQuestion,
  generateChartQuestion,
  generateCubeNetQuestion,
  generateCubeNetQuestion,
  generateArrowMatrixQuestion,
  generateArrowMatrixQuestion,
  generateCubeCountingQuestion,
  generateCubeCountingQuestion,
];

// Factor mapping for generated questions (UVE exam structure)
const FACTOR_GENERATORS = {
  'factor-verbal': {
    visual: [],
    text: [generateSynonymQuestion, generateAntonymQuestion, generateAnalogyQuestion, generateClozeQuestion, generatePalabraDiferenteQuestion, generateDefinicionQuestion, generateCompletarFraseQuestion],
  },
  'factor-razonamiento': {
    visual: [generateDominoQuestion, generateMatrixQuestion, generateComplexSeriesQuestion, generateShapeAlgebraQuestion, generateCircuitQuestion, generateOddShapeQuestion, generatePinwheelQuestion, generateDividedCircleQuestion, generateClockSeriesQuestion, generateRadialSectorQuestion, generateNumberPairSeriesQuestion, generateArrowMatrixQuestion, generateShapeCardQuestion],
    text: [generateSilogismoQuestion, generateLetterSeriesQuestion],
  },
  'factor-numerico': {
    visual: [generateChartQuestion, generateNumberCardQuestion],
    text: [generateAptitudNumericaQuestion, generateLetterValueAlgebraQuestion, generateNumberSeriesQuestion, generateWrongNumberQuestion],
  },
  'factor-espacial': {
    visual: [generateCubeCountingQuestion, generateGridPatternQuestion, generateOverlayQuestion, generateFoldingQuestion, generateCountingQuestion, generateSymbolFrequencyQuestion, generateGridComparisonQuestion, generateSphereRotationQuestion, generateCubeNetQuestion, generateSymbolAlphabetQuestion, generateLetterGridQuestion],
    text: [generateLetterCoincidenceQuestion],
  },
};

export function generateVisualQuestions(count = 12, seed = Date.now()) {
  const rng = seededRandom(seed);
  const questions = [];
  const seen = new Set();
  let safety = 0;
  while (questions.length < count && safety < count * 10) {
    safety++;
    const gen = pick(VISUAL_GENERATORS, rng);
    try {
      const q = gen(rng);
      if (q && !seen.has(q.id) && validateQuestion(q)) {
        seen.add(q.id);
        questions.push(q);
      }
    } catch(e) { /* skip failed generation */ }
  }
  return questions;
}

const TEXT_GENERATORS = [
  generateSilogismoQuestion,
  generateSilogismoQuestion,
  generateTableQuestion,
  generateLetterCoincidenceQuestion,
  generateLetterCoincidenceQuestion,
  generateLetterCoincidenceQuestion,
  generateClozeQuestion,
  generateClozeQuestion,
  generateAptitudNumericaQuestion,
  generateAptitudNumericaQuestion,
  generateAptitudNumericaQuestion,
  generateAptitudNumericaQuestion,
  generateLetterValueAlgebraQuestion,
  generateLetterValueAlgebraQuestion,
  generateLetterSeriesQuestion,
  generateLetterSeriesQuestion,
  generateLetterSeriesQuestion,
  generateNumberSeriesQuestion,
  generateNumberSeriesQuestion,
  generateNumberSeriesQuestion,
  generateWrongNumberQuestion,
  generateWrongNumberQuestion,
  generateSynonymQuestion,
  generateSynonymQuestion,
  generateSynonymQuestion,
  generateAntonymQuestion,
  generateAntonymQuestion,
  generateAntonymQuestion,
  generateAnalogyQuestion,
  generateAnalogyQuestion,
  generateAnalogyQuestion,
];

export function generateTextQuestions(count = 4, seed = Date.now()) {
  const rng = seededRandom(seed + 999);
  const questions = [];
  const seen = new Set();
  let safety = 0;
  while (questions.length < count && safety < count * 10) {
    safety++;
    const gen = pick(TEXT_GENERATORS, rng);
    try {
      const q = gen(rng);
      if (q && !seen.has(q.id) && validateQuestion(q)) { seen.add(q.id); questions.push(q); }
    } catch(e) { /* skip */ }
  }
  return questions;
}

export function generateFactorQuestions(factor, count, seed = Date.now()) {
  const mapping = FACTOR_GENERATORS[factor];
  if (!mapping) return [];
  const rng = seededRandom(seed);
  const pool = [...mapping.visual, ...mapping.text];
  if (pool.length === 0) return [];
  const questions = [];
  const seen = new Set();
  let safety = 0;
  while (questions.length < count && safety < count * 10) {
    safety++;
    const gen = pick(pool, rng);
    try {
      const q = gen(rng);
      if (q && !seen.has(q.id) && validateQuestion(q)) {
        seen.add(q.id);
        questions.push(q);
      }
    } catch(e) { /* skip */ }
  }
  return questions;
}
