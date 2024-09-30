// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import '../styles/Login.css'; // Certifique-se de que o caminho está correto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Inicialize useNavigate

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aqui você pode adicionar lógica de autenticação, se necessário
    
    // Redireciona para a página Home após o login
    navigate('/portal/inventario');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Login</h1>
        <label htmlFor="email" className="login-label">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          placeholder="Enter your email"
          required
        />
        <label htmlFor="password" className="login-label">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          placeholder="Enter your password"
          required
        />
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
