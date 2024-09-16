// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // Importa o CSS global
import './Home.css'; // Importa o CSS específico da página

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Home</h1>
      <div className="home-buttons">
        <button className="home-button home-button--licencas" onClick={() => navigate('/licencas')}>Licenças</button>
        <button className="home-button home-button--inventario" onClick={() => navigate('/inventario')}>Inventário</button>
      </div>
    </div>
  );
}

export default Home;
