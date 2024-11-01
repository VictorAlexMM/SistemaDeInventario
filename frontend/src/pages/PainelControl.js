import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './PainelControl.css';

// Configuração do Modal
Modal.setAppElement('#root'); // Acesse o elemento raiz para acessibilidade

const UserAccountApp = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState('');
  const [fullName, setFullName] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://mao-s038:5000/add-usuario');
      setAccounts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddAccount = async () => {
    try {
      const response = await axios.post('http://mao-s038:5000/usuarios', {
        username,
        profile,
        fullName,
      });
      setAccounts([...accounts, response.data]);
      setUsername('');
      setProfile('');
      setFullName('');
      setModalIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Adicionar Conta de Usuário</h1>
      <div className="add-account-container">
        <button className="add small" onClick={() => setModalIsOpen(true)}>Adicionar Conta</button>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por Username"
          className="search-input"
        />
      </div>

      <h2>Contas Existentes</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Perfil</th>
            <th>Nome Completo</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account, index) => (
            <tr key={index}>
              <td>{account.username}</td>
              <td>{account.profile}</td>
              <td>{account.fullName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
 onRequestClose={() => setModalIsOpen(false)}
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <h2>Adicionar Nova Conta</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="text"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="Perfil"
        />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nome Completo"
        />
        <button className="add" onClick={handleAddAccount}>Adicionar Conta</button>
        <button className="close" onClick={() => setModalIsOpen(false)}>Fechar</button>
      </Modal>
    </div>
  );
}

export default UserAccountApp;