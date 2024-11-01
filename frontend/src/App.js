import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Licencas from './pages/Licencas';
import Estoque from './pages/Estoque';
import Comodato from './pages/Comodato';
import PainelControl from './pages/PainelControl';
import Comodatointer from './pages/ComodatoInter'

import './styles/App.css';


const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isComodatoPage = location.pathname === '/portal/comodato'; 
  const isComodatoInterPage = location.pathname === '/portal/comodatointer'; // Verifica se está na página ComodatoInter

  return (
    <div className="app-container">
      {/* Exibe a NavBar se não estiver na página de login ou em comodato */}
      {!isLoginPage && !isComodatoPage && !isComodatoInterPage && <NavBar />}
      <div className="content-container">
        {children}
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="portal/Home" element={<Layout><Home /></Layout>} />
        <Route path="/portal/licencas" element={<Layout><Licencas /></Layout>} />
        <Route path="/portal/inventario" element={<Layout><Estoque /></Layout>} />
        <Route path="/portal/comodato" element={<Layout><Comodato /></Layout>} />
        <Route path="/portal/comodatointer" element={<Layout><Comodatointer /></Layout>} />
        <Route path="/portal/painel" element={<Layout><PainelControl /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;