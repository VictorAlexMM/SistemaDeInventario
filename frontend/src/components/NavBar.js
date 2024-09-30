// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <Link to="/portal/licencas">Licenças</Link>
      <Link to="/portal/inventario">Inventário</Link>
      <Link to="/portal/comodato">Comodato</Link>
    </nav>
  );
};

export default NavBar;