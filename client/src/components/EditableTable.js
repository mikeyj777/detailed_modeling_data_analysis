import React from 'react';

const EditableTable = ({ data, setData, isReadOnly }) => {
  const handleInputChange = (e, rowIndex, field) => {
    const value = e.target.value;
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex][field] = value;
      return newData;
    });
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
      <thead>
        <tr>
          <th>Test Case</th>
          <th>Concentration (ppm)</th>
          <th>Area (m²)</th>
          <th>Avg Molecular Weight</th>
          <th>Temperature (°C)</th>
          <th>Elevation (m)</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 20).map((row, rowIndex) => (
          <tr key={row.id || rowIndex}>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
              {row.testCase}
            </td>
            {['concPpm', 'areaM2', 'aveMwVap', 'tempC', 'elevM'].map((field) => (
              <td key={field} style={{ border: '1px solid #ccc', padding: '8px' }}>
                <input
                  type="number"
                  value={row[field]}
                  onChange={(e) => handleInputChange(e, rowIndex, field)}
                  disabled={isReadOnly}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EditableTable;
