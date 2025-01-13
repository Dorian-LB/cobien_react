import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisioPage from './components/VisioPage';
import HomePage from './components/HomePage';
import MQTTHandler from './components/MQTTHandler'; 
import ScreenSaver from './components/ScreenSaver.js';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<ScreenSaver />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/visio" element={<VisioPage />} />
      </Routes>
    </div>
  );
}

const AppWithRouter = () => (
  <Router>
    <MQTTHandler>
      <App />
    </MQTTHandler>
  </Router>
);

export default AppWithRouter;