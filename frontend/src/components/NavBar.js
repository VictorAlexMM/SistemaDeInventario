import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import axios from 'axios';

const NavBar = () => {
  const navigate = useNavigate();

 /* const handleLogout = async () => {
    try {
      // Remova o token de autenticação do local storage
      localStorage.removeItem('token');
      // Faça uma chamada para o endpoint de logout no servidor
      await axios.post('http://http://localhost:5000/logout');
      // Redirecione o usuário para a página de login
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
    }
            <Link to="/portal/comodato">Comodato</Link>
  };*/

  return (
    <nav className="navbar">
      <Link to="/portal/licencas">Licenças</Link>
      <Link to="/portal/inventario">Inventário</Link>
    </nav>
  );
};

export default NavBar;