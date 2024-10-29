import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('loggedUser '); 
    } catch (error) {
      console.error('Erro ao sair:', error); 
    } finally {
      navigate('/', { replace: true }); 
    }
  };

  return (
    <nav className="navbar">
      <Link to="/portal/Home">Home</Link>
      <Link to="/portal/inventario">Inventário</Link>
      <Link to="/portal/comodato">Comodato</Link>
      <button onClick={handleLogout} className="logout-button">Sair</button>
    </nav>
  );
};

export default NavBar;
