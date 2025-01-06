// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Planifier une Visio</h1>
      <Link to="/visio">
        <button className="visio-button">Démarrer une Visio</button>
      </Link>
    </div>
  );
}

export default HomePage;