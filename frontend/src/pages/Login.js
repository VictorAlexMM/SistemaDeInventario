import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
      const parsedLoggedUser = JSON.parse(loggedUser);
      navigate('/portal/inventario', { state: { logged: parsedLoggedUser } });
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate wait
      const response = await axios.post('http://10.0.11.55:31636/api/v1/AuthAd', {
        username,
        password,
      });

      const data = response.data;
      localStorage.setItem('loggedUser', JSON.stringify({ username }));
      navigate('/portal/inventario', { state: { logged: { username } } });
    } catch (error) {
      if (error.response) {
        // If the API response indicates an error
        setError(error.response.data.error || 'Erro ao fazer login');
      } else {
        setError('Erro ao fazer login');
      }
    }
  };

  return (
    <div className="main">
      <h2>Login</h2>
      <div className="form-container">
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
          <button type="button" className="login-button" onClick={handleLogin}>
            Login
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;
