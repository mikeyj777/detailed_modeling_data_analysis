import React, { useState, useRef, useEffect } from 'react';
import SurfacePlot from './SurfacePlot';
import Papa from 'papaparse';
import '../styles/Components.css'; // Import the CSS file

function VisualizationPage() {
  const [groupedData, setGroupedData] = useState({});
  const [isCsvData, setIsCsvData] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const concentrationsPerPage = 4;

  // References to the scrollable containers
  const scrollContainerRef = useRef(null);
  const topScrollRef = useRef(null);

  // State for arrow visibility
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Flag to indicate programmatic scrolling
  const isScrolling = useRef(false);

  // State for selected plot type
  const [plotType, setPlotType] = useState('mesh3d');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      parseCsvFile(file);
    }
  };

  const loadDefaultData = () => {
    fetch('/data/data.csv')
      .then((response) => response.text())
      .then((csvText) => {
        parseCsvData(csvText);
      })
      .catch((error) => {
        console.error('Error fetching default data:', error);
      });
  };

  const parseCsvFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  const parseCsvData = (csvText) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  const processParsedData = (data) => {
    const parsedData = data
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

  // Constants for column dimensions
  const columnWidth = 600; // Should match the width in the style
  const columnMargin = 20; // Should match the marginRight in the style

  // Calculate content width for the top scrollbar
  const contentWidth = currentConcentrations.length * (columnWidth + columnMargin);

  // Scrolling functions
  const scrollLeft = () => {
    if (scrollContainerRef.current && topScrollRef.current) {
      isScrolling.current = true;
      scrollContainerRef.current.scrollBy({ left: -600, behavior: 'smooth' });
      topScrollRef.current.scrollBy({ left: -600, behavior: 'smooth' });

      setTimeout(() => {
        isScrolling.current = false;
      }, 500); // Adjust timeout as needed
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && topScrollRef.current) {
      isScrolling.current = true;
      scrollContainerRef.current.scrollBy({ left: 600, behavior: 'smooth' });
      topScrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });

      setTimeout(() => {
        isScrolling.current = false;
      }, 500); // Adjust timeout as needed
    }
  };

  // Handle arrow visibility and synchronize scroll positions
  const handleScroll = () => {
    if (isScrolling.current) {
      return;
    }

    const scrollEl = scrollContainerRef.current;
    const topScrollEl = topScrollRef.current;

    if (scrollEl && topScrollEl) {
      const { scrollLeft: sl, scrollWidth, clientWidth } = scrollEl;

      setCanScrollLeft(sl > 0);
      setCanScrollRight(sl + clientWidth < scrollWidth);

      // Synchronize scroll positions
      topScrollEl.scrollLeft = sl;
    }
  };

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const topScrollEl = topScrollRef.current;

    if (scrollEl && topScrollEl) {
      const syncScroll = () => {
        if (isScrolling.current) return;
        topScrollEl.scrollLeft = scrollEl.scrollLeft;
        handleScroll();
      };
      const syncScrollTop = () => {
        if (isScrolling.current) return;
        scrollEl.scrollLeft = topScrollEl.scrollLeft;
        handleScroll();
      };
      scrollEl.addEventListener('scroll', syncScroll);
      topScrollEl.addEventListener('scroll', syncScrollTop);

      handleScroll(); // Initial check

      return () => {
        scrollEl.removeEventListener('scroll', syncScroll);
        topScrollEl.removeEventListener('scroll', syncScrollTop);
      };
    }
  }, [currentConcentrations]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Visualization</h1>

      {/* Controls Container */}
      <div className="controls-container">
        {/* File Upload */}
        <div className="custom-file-input">
          <input
            type="file"
            id="csvUpload"
            accept=".csv"
            onChange={handleFileUpload}
          />
          <label htmlFor="csvUpload">Upload CSV File</label>
        </div>

        {/* Load Default Data Button */}
        <button className="custom-button" onClick={loadDefaultData}>
          Load Default Data
        </button>

        {/* Plot Type Dropdown */}
        <div className="custom-select-container">
          <label htmlFor="plotTypeSelect" className="custom-select-label">
            Plot Type:
          </label>
          <select
            id="plotTypeSelect"
            value={plotType}
            onChange={(e) => setPlotType(e.target.value)}
            className="custom-select"
          >
            <option value="mesh3d">Mesh 3D</option>
            <option value="scatter3d">Scatter 3D</option>
            <option value="isosurface">Isosurface</option>
            <option value="volume">Volume</option>
          </select>
        </div>
      </div>

      {/* Status Message */}
      {isCsvData && (
        <div className="status-message success">
          Data is loaded from CSV file.
        </div>
      )}

      {/* Navigation Controls */}
      {totalPages > 1 && (
        <div className="nav-controls">
          <button
            className="custom-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <button
            className="custom-button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
      )}

      {/* Top Scrollbar */}
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '16px',
        }}
        ref={topScrollRef}
      >
        <div style={{ width: `${contentWidth}px`, height: '1px' }} />
      </div>

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
        {/* Concentration Columns */}
        {currentConcentrations.map((concPpm) => (
          <div
            key={concPpm}
            style={{
              flex: '0 0 auto',
              width: `${columnWidth}px`,
              marginRight: `${columnMargin}px`,
            }}
          >
            <h3>Concentration: {concPpm} ppm</h3>
            {plotConfigs.map((config, index) => (
              <div key={index} style={{ marginTop: '20px' }}>
                <SurfacePlot
                  data={groupedData[concPpm]}
                  plotType={plotType} // Pass the selected plot type
                  {...config}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <div
        onClick={scrollLeft}
        className="scroll-arrow left"
        style={{ display: 'block' }}
      >
        &#9664;
      </div>

      {/* Right Arrow */}
      <div
        onClick={scrollRight}
        className="scroll-arrow right"
        style={{ display: 'block' }}
      >
        &#9654;
      </div>
    </div>
  );
}

export default VisualizationPage;
