// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VisualizationPage from './components/VisualizationPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/viz" element={<VisualizationPage />} />
      </Routes>
    </Router>
  );
}

export default App;