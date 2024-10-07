import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [error, setError] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/portal/inventario'); // Redireciona para a nova rota
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateUser = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/criar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, nomeCompleto }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      alert('Usuário criado com sucesso! Você pode fazer login agora.');
      setIsCreatingUser(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggle = () => {
    setIsCreatingUser(!isCreatingUser);
  };

  return (
    <div className="main">
      <h2>{isCreatingUser ? 'Criar Conta' : 'Login'}</h2>
      <div className="login-checkbox">
        <input type="checkbox" id="chk" checked={isCreatingUser} onChange={handleToggle} aria-hidden="true" />
        <label htmlFor="chk">Criar Usuário</label>
      </div>
  
      <div className="form-container">
        {isCreatingUser ? (
          <div className="signup">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="input-container">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <button type="button" onClick={handleCreateUser}>Criar Usuário</button>
            </form>
          </div>
        ) : (
          <div className="login">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="input-container">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <button type="button" onClick={handleLogin}>Login</button>
            </form>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
