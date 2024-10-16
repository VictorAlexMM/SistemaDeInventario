import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('loggedUser'); // Remove o usuário logado do armazenamento local
      navigate('/', { replace: true }); // Redireciona para a página de Login
    } catch (error) {
      console.error('Erro ao sair:', error); // Log de erro caso algo dê errado
    }
  };

  return (
    <nav className="navbar">
      <Link to="/portal/licencas">Licenças</Link>
      <Link to="/portal/inventario">Inventário</Link>
      <Link to="/portal/comodato">Comodato</Link>
      <button onClick={handleLogout} className="logout-button">Sair</button>
    </nav>
  );
};

export default NavBar;
