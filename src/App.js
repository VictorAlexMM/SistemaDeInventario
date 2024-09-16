// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Home from './pages/Home';
import Licencas from './pages/Licencas';
import Estoque from './pages/Estoque';
import Comodato from './pages/Comodato';
import './styles/App.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isComodatoPage = location.pathname === '/comodato';

  return (
    <div className="app-container">
      {!isLoginPage && !isComodatoPage && <NavBar />}
      <div className="content-container">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="/Home" element={<Layout><Home /></Layout>} />
        <Route path="/licencas" element={<Layout><Licencas /></Layout>} />
        <Route path="/inventario" element={<Layout><Estoque /></Layout>} />
        <Route path="/comodato" element={<Layout><Comodato /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
