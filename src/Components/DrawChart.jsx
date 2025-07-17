import React, { useState, useRef, useEffect } from 'react';
import './DrawChart.css';

const parseFunc = (expr) => {
  try {
    const safeExpr = expr
      .replace(/\^/g, '**')
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      // zamień funkcje na Math.<funkcja>
      .replace(/\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|exp|abs)\b/g, 'Math.$1')
      .replace(/\bln\b/g, 'Math.log') // ln → Math.log
      .replace(/\bsqrt\b/g, 'Math.sqrt') // √ → sqrt jeśli chcesz
      .replace(/√/g, 'Math.sqrt'); // również √x → Math.sqrt(x)

    return new Function('x', 'return ' + safeExpr);
  } catch {
    return () => NaN;
  }
};


export default function DrawChart() {
  const canvasRef = useRef(null);
  const [tab, setTab] = useState('plot');
  const [expression, setExpression] = useState('x^2');
  const [showOptions, setShowOptions] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);
  const [angleMode, setAngleMode] = useState('RAD');
  const [hoverPoint, setHoverPoint] = useState(null); // { x, y, px, py }

  const width = 500;
  const height = 300;

  const [domain, setDomain] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10
  });

  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const xToPx = (x) => ((x - domain.xMin) / (domain.xMax - domain.xMin)) * width;
  const yToPx = (y) => height - ((y - domain.yMin) / (domain.yMax - domain.yMin)) * height;

  const getNiceStep = (range, targetSteps = 10) => {
  const roughStep = range / targetSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep;
  if (residual < 1.5) niceStep = 1;
  else if (residual < 3) niceStep = 2;
  else if (residual < 7) niceStep = 5;
  else niceStep = 10;

  return niceStep * magnitude;
};


  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const func = parseFunc(expression);

    // Dynamic step size for grid
    //const xStep = Math.pow(10, Math.floor(Math.log10(domain.xMax - domain.xMin)) - 1);
    //const yStep = Math.pow(10, Math.floor(Math.log10(domain.yMax - domain.yMin)) - 1);
    const xStep = getNiceStep(domain.xMax - domain.xMin);
    const yStep = getNiceStep(domain.yMax - domain.yMin);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(domain.xMin / xStep) * xStep; x <= domain.xMax; x += xStep) {
      const px = xToPx(x);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    for (let y = Math.ceil(domain.yMin / yStep) * yStep; y <= domain.yMax; y += yStep) {
      const py = yToPx(y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

        // Draw labels
    ctx.fillStyle = '#FCD8B4';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = Math.ceil(domain.xMin / xStep) * xStep; x <= domain.xMax; x += xStep) {
      const px = xToPx(x);
      if (px < 0 || px > width) continue;
      ctx.fillText(parseFloat(x.toFixed(5)), px, yToPx(0) + 4);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = Math.ceil(domain.yMin / yStep) * yStep; y <= domain.yMax; y += yStep) {
      const py = yToPx(y);
      if (py < 0 || py > height) continue;
      ctx.fillText(parseFloat(y.toFixed(5)), xToPx(0) - 4, py);
    }


    // Draw axes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    const zeroX = xToPx(0);
    const zeroY = yToPx(0);

    if (domain.yMin < 0 && domain.yMax > 0) {
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
    }

    if (domain.xMin < 0 && domain.xMax > 0) {
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, height);
      ctx.stroke();
    }

    // Draw function
    ctx.beginPath();
    ctx.strokeStyle = '#fa6926';
    ctx.lineWidth = lineWidth;
    let first = true;

    for (let px = 0; px < width; px++) {
      const x = domain.xMin + (px / width) * (domain.xMax - domain.xMin);
      const y = func(x);
      const py = yToPx(y);
      if (isFinite(y)) {
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    if (hoverPoint) {
      ctx.beginPath();
      ctx.arc(hoverPoint.px, hoverPoint.py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FCD8B4';
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`(${hoverPoint.x.toFixed(2)}, ${hoverPoint.y.toFixed(2)})`, hoverPoint.px + 8, hoverPoint.py - 8);
    }

  };

  useEffect(() => {
    if (tab === 'plot') draw();
  }, [expression, domain, lineWidth, tab, hoverPoint]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Obsługa przeciągania
  if (dragging) {
    const dx = (e.clientX - start.x) / width * (domain.xMax - domain.xMin);
    const dy = (e.clientY - start.y) / height * (domain.yMax - domain.yMin);

    setDomain(prev => ({
      xMin: prev.xMin - dx,
      xMax: prev.xMax - dx,
      yMin: prev.yMin + dy,
      yMax: prev.yMax + dy
    }));

    setStart({ x: e.clientX, y: e.clientY });
  } else if (tab === 'plot') {
    // Obsługa hover-pointa
    const x = domain.xMin + (mouseX / width) * (domain.xMax - domain.xMin);
    const y = parseFunc(expression)(x);

    const px = xToPx(x);
    const py = yToPx(y);
    const dist = Math.abs(py - mouseY);

    if (isFinite(y) && dist < 10) {
      setHoverPoint({ x, y, px, py });
    } else {
      setHoverPoint(null);
    }
  }
};


  const handleMouseUp = () => setDragging(false);

  const centerZoom = (val, center, factor) => center + (val - center) * factor;

  const handleWheel = (e) => {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1 / 1.1 : 1.1;

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    const x = domain.xMin + (mouseX / width) * (domain.xMax - domain.xMin);
    const y = domain.yMax - (mouseY / height) * (domain.yMax - domain.yMin);

    setDomain(prev => ({
      xMin: centerZoom(prev.xMin, x, zoom),
      xMax: centerZoom(prev.xMax, x, zoom),
      yMin: centerZoom(prev.yMin, y, zoom),
      yMax: centerZoom(prev.yMax, y, zoom)
    }));
  };

  return (
    <div className="draw-chart">
      <div className="tabs">
        <button className={tab === 'keyboard' ? 'active' : ''} onClick={() => setTab('keyboard')}>Keyboard</button>
        <button className={tab === 'plot' ? 'active' : ''} onClick={() => setTab('plot')}>Chart</button>
      </div>

      {tab === 'keyboard' && (
        <div className="keyboard-tab">
          <input
            type="text"
            value={expression}
            onChange={e => setExpression(e.target.value)}
            placeholder="e.g. sin(x), x^2 + 3"
            className="expression-bar"
          />
          <div className="mini-keypad">
            {['x', '(', ')', '+', '-', '*', '/', '^', 'π', 'e', 'sin', 'cos', 'tan', '√', 'log', 'ln'].map(k => (
              <button key={k} onClick={() => setExpression(prev => prev + k)}>{k}</button>
            ))}
            <button onClick={() => setExpression(prev => prev.slice(0, -1))}>⌫</button>

            <button onClick={() => setExpression('')}>C</button>
            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => (
              <button key={k} onClick={() => setExpression(prev => prev + k)}>{k}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'plot' && (
        <div className="plot-tab">
          <div className="plot-header">
            <button onClick={() => setShowOptions(o => !o)}>⚙ Chart options</button>
          </div>

          {showOptions && (
            <div className="plot-options">
              <div className="axis-group">
                <label>X-Min: <input type="number" value={domain.xMin} onChange={e => setDomain(d => ({ ...d, xMin: parseFloat(e.target.value) }))} /></label>
                <label>X-Max: <input type="number" value={domain.xMax} onChange={e => setDomain(d => ({ ...d, xMax: parseFloat(e.target.value) }))} /></label>
                <label>Y-Min: <input type="number" value={domain.yMin} onChange={e => setDomain(d => ({ ...d, yMin: parseFloat(e.target.value) }))} /></label>
                <label>Y-Max: <input type="number" value={domain.yMax} onChange={e => setDomain(d => ({ ...d, yMax: parseFloat(e.target.value) }))} /></label>
              </div>

              <div className="angle-group">
                Units:
                <button onClick={() => setAngleMode('RAD')} className={angleMode === 'RAD' ? 'active' : ''}>Radians</button>
                <button onClick={() => setAngleMode('DEG')} className={angleMode === 'DEG' ? 'active' : ''}>Degrees</button>
              </div>

              <div className="line-group">
                <label>Line width:
                  <input type="range" min="1" max="6" value={lineWidth} onChange={e => setLineWidth(parseInt(e.target.value))} />
                </label>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>
      )}
    </div>
  );
}
