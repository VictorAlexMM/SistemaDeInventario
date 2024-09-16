// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../components/Navbar.css'; // Corrija o nome do arquivo aqui se necessário

const NavBar = () => {
  return (
    <nav className="navbar">
      <Link to="/home">Home</Link>
      <Link to="/licencas">Licenças</Link>
      <Link to="/inventario">Inventário</Link>
      <Link to="/comodato">Comodato</Link>
    </nav>
  );
};

export default NavBar;
