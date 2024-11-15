import React, { useState } from 'react';
import SurfacePlot from './SurfacePlot';
import Papa from 'papaparse';

function VisualizationPage() {
  const [groupedData, setGroupedData] = useState({});
  const [isCsvData, setIsCsvData] = useState(false);

  const handleFileUpload = (event) => {
    // ... existing code ...
  };

  // Plot configurations
  const plotConfigs = [
    {
      xField: 'tempC',
      yField: 'elevM',
      xLabel: 'Temperature (°C)',
      yLabel: 'Elevation (m)',
    },
    {
      xField: 'tempC',
      yField: 'aveMwVap',
      xLabel: 'Temperature (°C)',
      yLabel: 'Avg Molecular Weight',
    },
    {
      xField: 'elevM',
      yField: 'aveMwVap',
      xLabel: 'Elevation (m)',
      yLabel: 'Avg Molecular Weight',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Visualization</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="csvUpload">Upload CSV File:</label>
        <input
          type="file"
          id="csvUpload"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ marginLeft: '10px' }}
        />
      </div>

      {isCsvData && (
        <div style={{ marginBottom: '20px', color: 'blue' }}>
          Data is loaded from CSV file.
        </div>
      )}

      {/* Display plots grouped by concentration */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: '20px',
        }}
      >
        {Object.keys(groupedData).map((concPpm) => (
          <div
            key={concPpm}
            style={{
              flex: '0 0 auto',
              width: '700px', // Increased width
              marginRight: '20px',
            }}
          >
            <h3>Concentration: {concPpm} ppm</h3>
            {plotConfigs.map((config, index) => (
              <div key={index} style={{ marginTop: '20px' }}>
                <SurfacePlot data={groupedData[concPpm]} {...config} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VisualizationPage;
