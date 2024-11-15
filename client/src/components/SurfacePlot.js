import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Modal from './Modal';
import '../styles/Components.css'; // Import CSS if not already

const SurfacePlot = ({ data, xField, yField, xLabel, yLabel, plotType }) => {
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

  // Determine plot data based on plotType
  let plotData = [];
  let layout = {};

  switch (plotType) {
    case 'scatter3d':
      plotData = [
        {
          x: xData,
          y: adjustedYData,
          z: zData,
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: 3,
            color: zData,
            colorscale: 'Viridis',
          },
          text: data.map((row) => `Test Case: ${row.testCase}`),
          hoverinfo: 'x+y+z+text',
        },
      ];
      layout = {
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: 'Area (m²)' },
        },
        autosize: true,
        title: `Area (m²) vs ${xLabel} and ${yLabel}`,
        margin: { l: 0, r: 0, b: 0, t: 50 },
      };
      break;

    case 'isosurface':
      plotData = [
        {
          x: xData,
          y: adjustedYData,
          z: zData,
          value: zData,
          type: 'isosurface',
          isomin: Math.min(...zData),
          isomax: Math.max(...zData),
          caps: { x: { show: false }, y: { show: false } },
          surface: { count: 5 },
          colorscale: 'Viridis',
          text: data.map((row) => `Test Case: ${row.testCase}`),
          hoverinfo: 'x+y+z+text',
        },
      ];
      layout = {
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: 'Area (m²)' },
        },
        autosize: true,
        title: `Isosurface: Area (m²) vs ${xLabel} and ${yLabel}`,
        margin: { l: 0, r: 0, b: 0, t: 50 },
      };
      break;

    case 'volume':
      plotData = [
        {
          x: xData,
          y: adjustedYData,
          z: zData,
          value: zData,
          type: 'volume',
          isomin: Math.min(...zData),
          isomax: Math.max(...zData),
          opacity: 0.1,
          surface: { count: 5 },
          colorscale: 'Viridis',
          text: data.map((row) => `Test Case: ${row.testCase}`),
          hoverinfo: 'x+y+z+text',
        },
      ];
      layout = {
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: 'Area (m²)' },
        },
        autosize: true,
        title: `Volume: Area (m²) vs ${xLabel} and ${yLabel}`,
        margin: { l: 0, r: 0, b: 0, t: 50 },
      };
      break;

    default:
      // Default to 'mesh3d'
      plotData = [
        {
          x: xData,
          y: adjustedYData,
          z: zData,
          type: 'mesh3d',
          intensity: zData,
          colorscale: 'Viridis',
          text: data.map((row) => `Test Case: ${row.testCase}`),
          hoverinfo: 'x+y+z+text',
        },
      ];
      layout = {
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: 'Area (m²)' },
        },
        autosize: true,
        title: `Area (m²) vs ${xLabel} and ${yLabel}`,
        margin: { l: 0, r: 0, b: 0, t: 50 },
      };
      break;
  }

  // Adjusted plot styles for larger size
  const plotStyle = { width: '100%', height: '500px' }; // Increased height
  const modalPlotStyle = { width: '100%', height: '80vh' };

  return (
    <div style={{ position: 'relative', marginBottom: '30px' }}>
      <button
        onClick={() => setIsModalOpen(true)}
        className="custom-button"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
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
