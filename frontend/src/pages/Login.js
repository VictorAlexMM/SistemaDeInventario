import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para controle de loading

  useEffect(() => {
    const loggedUser  = localStorage.getItem('loggedUser '); // Removido espaço
    if (loggedUser ) {
      const parsedLoggedUser  = JSON.parse(loggedUser );
      navigate('/portal/inventario', { state: { logged: parsedLoggedUser  } });
    }
  }, [navigate]);

  // Função para validar se o username existe
  const validateUsername = async (username) => {
    try {
      const response = await axios.post('http://localhost:5000/validateUser', { // Removido espaço
        username,
      });
      return response.data.valid; // Verifica se a resposta da API indica que o usuário é válido
    } catch (error) {
      setError('Erro ao validar username');
      return false;
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true); // Inicia o loading

    // Validação do username
    const isUsernameValid = await validateUsername(username);
    if (!isUsernameValid) {
      setError('Username não encontrado');
      setLoading(false); // Finaliza o loading
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula espera
      const response = await axios.post('http://10.0.11.55:31636/api/v1/AuthAd', {
        username,
        password,
      });

      const data = response.data;
      localStorage.setItem('loggedUser ', JSON.stringify({ username })); // Removido espaço
      navigate('/portal/inventario', { state: { logged: { username } } });
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Erro ao fazer login');
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false); // Finaliza o loading
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
          <button 
            type="button" 
            className="login-button" 
            onClick={handleLogin} 
            disabled={loading} // Desabilita o botão durante o loading
          >
            {loading ? 'Carregando...' : 'Login'} {/* Exibe mensagem de loading */}
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;