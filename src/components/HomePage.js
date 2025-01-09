import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToVisio } from './utils';

function HomePage() {
  const navigate = useNavigate();

  const handleStartVisio = () => {
    navigateToVisio(navigate);
  };

  return (
    <div className="home-page">
      <h1>Planifier une Visio</h1>
      <button onClick={handleStartVisio} className="visio-button">
        Démarrer une Visio
      </button>
    </div>
  );
}

export default HomePage;