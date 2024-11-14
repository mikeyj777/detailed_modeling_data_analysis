import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Modal from './Modal';

const SurfacePlot = ({ data, xField, yField, xLabel, yLabel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const xData = data.map((row) => row[xField]);
  const yData = data.map((row) => row[yField]);
  const zData = data.map((row) => row.areaM2); // Using areaM2 as Z-axis

  const plotData = [
    {
      x: xData,
      y: yData,
      z: zData,
      mode: 'markers',
      type: 'mesh3d',
      marker: {
        size: 5,
        color: zData,
        colorscale: 'Viridis',
        colorbar: { title: 'Area (m²)' },
      },
      text: data.map((row) => `Test Case: ${row.testCase}`),
      hovertemplate: `<b>${xLabel}:</b> %{x}<br><b>${yLabel}:</b> %{y}<br><b>Area:</b> %{z}<br>%{text}<extra></extra>`,
    },
  ];

  const layout = {
    scene: {
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
      zaxis: { title: 'Area (m²)' },
    },
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 50 },
    title: `Area (m²) vs ${xLabel} and ${yLabel}`,
  };

  const plotStyle = { width: '100%', height: '400px' };
  const modalPlotStyle = { width: '100%', height: '80vh' };

  return (
    <div style={{ position: 'relative' }}>
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
