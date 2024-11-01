
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Licencas from './components/Licencas';
import Estoque from './components/Estoque';
import PainelControl from './pages/PainelControl'
import './styles/App.css';
import Comodato from './pages/Comodato';
import Home from './pages/Home';
import ComodatoInter from './pages/ComodatoInter';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/portal/Home" element={<Home />} />
        <Route path="/portal/licencas" element={<Licencas />} />
        <Route path="/portal/inventario" element={<Estoque />} />
        <Route path="/portal/comodato" element={<Comodato/>}/>
        <Route path="/portal/comodato" element={<ComodatoInter/>}/>
        <Route path="/portal/painel" element={<Painel/>}/>
      </Routes>
    </Router>
  );
}

export default App;