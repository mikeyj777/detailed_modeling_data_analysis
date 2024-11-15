import React, { useState, useRef, useEffect } from 'react';
import SurfacePlot from './SurfacePlot';
import Papa from 'papaparse';

function VisualizationPage() {
  const [groupedData, setGroupedData] = useState({});
  const [isCsvData, setIsCsvData] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const concentrationsPerPage = 4;

  // Reference to the scrollable container
  const scrollContainerRef = useRef(null);

  // State for arrow visibility
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
          setCurrentPage(0); // Reset to first page on new upload

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

  // Get an array of unique concentrations
  const concentrationValues = Object.keys(groupedData);

  // Calculate total pages
  const totalPages = Math.ceil(concentrationValues.length / concentrationsPerPage);

  // Get concentrations for the current page
  const currentConcentrations = concentrationValues.slice(
    currentPage * concentrationsPerPage,
    (currentPage + 1) * concentrationsPerPage
  );

  // Scrolling functions
  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({ left: -600, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 600, behavior: 'smooth' });
  };

  // Handle arrow visibility
  const handleScroll = () => {
    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(sl > 0);
    setCanScrollRight(sl + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check

      return () => {
        scrollEl.removeEventListener('scroll', handleScroll);
      };
    }
  }, [currentConcentrations]);

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

      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            style={{ marginRight: '10px' }}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
          <span style={{ marginLeft: '20px' }}>
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
      )}

      {/* Display plots for current concentrations */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: '20px',
          position: 'relative',
        }}
        ref={scrollContainerRef}
      >
        {/* Left Arrow */}
        {canScrollLeft && (
          <div
            onClick={scrollLeft}
            style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              padding: '10px',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            &#9664;
          </div>
        )}

        {/* Concentration Columns */}
        {currentConcentrations.map((concPpm) => (
          <div
            key={concPpm}
            style={{
              flex: '0 0 auto',
              width: '600px',
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

        {/* Right Arrow */}
        {canScrollRight && (
          <div
            onClick={scrollRight}
            style={{
              position: 'absolute',
              top: '50%',
              right: '0',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              padding: '10px',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            &#9654;
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizationPage;
