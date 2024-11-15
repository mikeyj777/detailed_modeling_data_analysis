import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Modal from './Modal';

const SurfacePlot = ({ data, xField, yField, xLabel, yLabel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract data
  const xData = data.map((row) => row[xField]);
  const yData = data.map((row) => row[yField]);
  const zData = data.map((row) => row.areaM2); // Using areaM2 as Z-axis

  // Adjust yData if it has constant values
  const yUniqueValues = [...new Set(yData)];
  let adjustedYData = yData;
  if (yUniqueValues.length === 1) {
    // Introduce slight variations to yData
    adjustedYData = yData.map((value, index) => value + index * 0.001);
  }

  const plotData = [
    {
      x: xData,
      y: adjustedYData,
      z: zData,
      type: 'scatter3d',
      intensity: zData,
      colorscale: 'Viridis',
      text: data.map((row) => `Test Case: ${row.testCase}`),
      hoverinfo: 'x+y+z+text',
    },
  ];

  const layout = {
    scene: {
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
      zaxis: { title: 'Area (m²)' },
    },
    autosize: true,
    title: `Area (m²) vs ${xLabel} and ${yLabel}`,
    margin: { l: 0, r: 0, b: 0, t: 50 },
  };

  // Adjusted plot styles for larger size
  const plotStyle = { width: '100%', height: '500px' }; // Increased height
  const modalPlotStyle = { width: '100%', height: '80vh' };

  return (
    <div style={{ position: 'relative', marginBottom: '30px' }}>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          padding: '5px 10px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Full Screen
      </button>

      <Plot
        data={plotData}
        layout={layout}
        style={plotStyle}
        useResizeHandler={true}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Plot
          data={plotData}
          layout={layout}
          style={modalPlotStyle}
          useResizeHandler={true}
        />
      </Modal>
    </div>
  );
};

export default SurfacePlot;
