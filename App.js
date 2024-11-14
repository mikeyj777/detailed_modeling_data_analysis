// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Plot3D from './components/Plot3D';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/plot3d" element={<Plot3D />} />
      </Routes>
    </Router>
  );
}

export default App;