import React, { useState, useEffect, useRef } from 'react';

const SurfacePlot = () => {
  const [rotation, setRotation] = useState({ x: 45, y: 45, z: 0 });
  const [points, setPoints] = useState([]);
  const [scale, setScale] = useState(1);
  const [gridSize, setGridSize] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const getDataExtents = () => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
      minZ = Math.min(minZ, point.z);
      maxZ = Math.max(maxZ, point.z);
    });

    // Add some padding
    const padding = 0.5;
    return {
      x: [minX - padding, maxX + padding],
      y: [minY - padding, maxY + padding],
      z: [minZ - padding, maxZ + padding]
    };
  };

  // Update SVG rendering section:
  const extents = getDataExtents();

  const [data, setData] = useState(() => {
    const initial = [];
    for (let x = -gridSize; x <= gridSize; x++) {
      const row = [];
      for (let y = -gridSize; y <= gridSize; y++) {
        row.push(Math.sin(x) * Math.cos(y));
      }
      initial.push(row);
    }
    return initial;
  });

  useEffect(() => {
    const newPoints = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const x = i - gridSize;
        const y = j - gridSize;
        const z = data[i][j];
        newPoints.push({
          x: x * scale,
          y: y * scale,
          z: z * scale,
          color: `rgb(${Math.floor((z + 1) * 127.5)}, ${Math.floor((z + 1) * 127.5)}, 255)`
        });
      }
    }
    setPoints(newPoints);
  }, [data, scale, gridSize]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setRotation(prev => ({
      x: (prev.x + deltaY * 0.5) % 360,
      y: (prev.y + deltaX * 0.5) % 360,
      z: prev.z
    }));
    
    setLastMousePos({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  useEffect(() => {
    const svg = svgRef.current;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, []);

  const handleCellChange = (i, j, value) => {
    const newData = [...data];
    newData[i][j] = Number(value) || 0;
    setData(newData);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text')
      .split('\n')
      .map(row => row.split('\t')
        .map(cell => Number(cell) || 0));
    
    if (pasteData.length > 0 && pasteData[0].length > 0) {
      const newGridSize = Math.floor((pasteData.length - 1) / 2);
      setGridSize(newGridSize);
      setData(pasteData);
    }
  };

  const project = (x, y, z) => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;
    const radZ = (rotation.z * Math.PI) / 180;
    
    let x1 = x;
    let y1 = y * Math.cos(radX) - z * Math.sin(radX);
    let z1 = y * Math.sin(radX) + z * Math.cos(radX);
    
    let x2 = x1 * Math.cos(radY) + z1 * Math.sin(radY);
    let y2 = y1;
    let z2 = -x1 * Math.sin(radY) + z1 * Math.cos(radY);
    
    let x3 = x2 * Math.cos(radZ) - y2 * Math.sin(radZ);
    let y3 = x2 * Math.sin(radZ) + y2 * Math.cos(radZ);
    
    const distance = 10;
    const scale = distance / (distance + z2);
    return {
      x: x3 * scale * 20 + 200,
      y: y3 * scale * 20 + 200,
      z: z2
    };
  };

  const createAxis = (start, end, label, tickCount = 6) => {
    const startProj = project(start.x, start.y, start.z);
    const endProj = project(end.x, end.y, end.z);
    
    // Generate tick marks
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const ratio = i / tickCount;
      const tickValue = (i - tickCount/2) * scale;
      const tickX = start.x + (end.x - start.x) * ratio;
      const tickY = start.y + (end.y - start.y) * ratio;
      const tickZ = start.z + (end.z - start.z) * ratio;
      
      const tickProj = project(tickX, tickY, tickZ);
      const tickLength = 3;
      let dx = 0, dy = 0;
      
      if (label === 'X') {
        dx = 0; dy = tickLength;
      } else if (label === 'Y') {
        dx = tickLength; dy = 0;
      } else {
        dx = tickLength; dy = tickLength;
      }

      ticks.push(
        <g key={`tick-${label}-${i}`}>
          <line
            x1={tickProj.x - dx}
            y1={tickProj.y - dy}
            x2={tickProj.x + dx}
            y2={tickProj.y + dy}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={tickProj.x + dx * 1.5}
            y={tickProj.y + dy * 1.5}
            textAnchor="middle"
            fill="#000"
            fontSize="10"
          >
            {tickValue.toFixed(1)}
          </text>
        </g>
      );
    }

    return (
      <g>
        <line
          x1={startProj.x}
          y1={startProj.y}
          x2={endProj.x}
          y2={endProj.y}
          stroke="#000"
          strokeWidth="1"
        />
        <text
          x={endProj.x + 15}
          y={endProj.y}
          textAnchor="start"
          fill="#000"
          fontSize="12"
          fontWeight="bold"
        >
          {label}
        </text>
        {ticks}
      </g>
    );
  };

  const sortedPoints = [...points].sort((a, b) => {
    const projA = project(a.x, a.y, a.z);
    const projB = project(b.x, b.y, b.z);
    return projB.z - projA.z;
  });

  const styles = {
    container: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: {
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 10px 0'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    plotContainer: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '10px',
      backgroundColor: '#fff',
      cursor: isDragging ? 'grabbing' : 'grab'
    },
    tableContainer: {
      overflowX: 'auto',
      maxHeight: '600px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    th: {
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      textAlign: 'center'
    },
    td: {
      padding: '0',
      borderBottom: '1px solid #e0e0e0',
      borderRight: '1px solid #e0e0e0'
    },
    input: {
      width: '100%',
      padding: '8px',
      border: 'none',
      textAlign: 'right',
      fontSize: '14px'
    },
    hint: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>3D Surface Plot with Data Table</h2>
        <div style={styles.hint}>Click and drag to rotate • Use mouse wheel to zoom</div>
      </div>
      <div style={styles.grid}>
        <div>
          <div 
            style={styles.plotContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg 
              ref={svgRef}
              width="400" 
              height="400" 
              style={{backgroundColor: '#fff'}}
            >
              {createAxis(
                {x: extents.x[0], y: 0, z: 0}, 
                {x: extents.x[1], y: 0, z: 0}, 
                'X'
              )}
              {createAxis(
                {x: 0, y: extents.y[0], z: 0}, 
                {x: 0, y: extents.y[1], z: 0}, 
                'Y'
              )}
              {createAxis(
                {x: 0, y: 0, z: extents.z[0]}, 
                {x: 0, y: 0, z: extents.z[1]}, 
                'Z'
              )}
              
              {sortedPoints.map((point, i) => {
                const proj = project(point.x, point.y, point.z);
                return (
                  <circle
                    key={i}
                    cx={proj.x}
                    cy={proj.y}
                    r="2"
                    fill={point.color}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Y/X</th>
                  {data[0].map((_, j) => (
                    <th key={j} style={styles.th}>{j - gridSize}</th>
                  ))}
                </tr>
              </thead>
              <tbody onPaste={handlePaste}>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td style={{...styles.td, backgroundColor: '#f5f5f5', textAlign: 'center'}}>{i - gridSize}</td>
                    {row.map((cell, j) => (
                      <td key={j} style={styles.td}>
                        <input
                          type="number"
                          value={cell}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                          style={styles.input}
                          step="0.1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurfacePlot;