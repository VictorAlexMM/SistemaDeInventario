// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Licencas from './components/Licencas';
import Estoque from './components/Estoque';
import './styles/App.css';
import Comodato from './pages/Comodato';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/portal/licencas" element={<Licencas />} />
        <Route path="/portal/inventario" element={<Estoque />} />
        <Route path="/portal/comodato" element={<Comodato/>}/>
      </Routes>
    </Router>
  );
}

export default App;