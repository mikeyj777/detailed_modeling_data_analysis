import React, { useState } from 'react';
import SurfacePlot from './SurfacePlot';
import Papa from 'papaparse';

function VisualizationPage() {
  const [groupedData, setGroupedData] = useState({});
  const [isCsvData, setIsCsvData] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data
            .filter(
              (row) =>
                row.test_case &&
                row.conc_ppm &&
                row.area_m2 &&
                row.ave_mw_vap &&
                row.temp_c &&
                row.elev_m
            )
            .map((row, index) => ({
              id: index + 1,
              testCase: row.test_case,
              concPpm: parseFloat(row.conc_ppm),
              areaM2: parseFloat(row.area_m2),
              aveMwVap: parseFloat(row.ave_mw_vap),
              tempC: parseFloat(row.temp_c),
              elevM: parseFloat(row.elev_m),
            }));

          // Group data by concPpm
          const grouped = {};
          parsedData.forEach((item) => {
            if (!grouped[item.concPpm]) {
              grouped[item.concPpm] = [];
            }
            grouped[item.concPpm].push(item);
          });

          setGroupedData(grouped);
          setIsCsvData(true);

          // Reset the file input's value
          event.target.value = null;
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          // Reset the file input's value in case of error
          event.target.value = null;
        },
      });
    }
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
