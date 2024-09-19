// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Ajuste o caminho para o CSS

const Header = () => (
  <nav className="navbar">
    <Link to="/">Home</Link>
    <Link to="/licencas">Licenças</Link>
    <Link to="/inventario">Inventário</Link>
  </nav>
);

export default Header;
