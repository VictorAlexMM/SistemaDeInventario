import React, { useState } from 'react';
import '../pages/Licencas.css'; // Importa o CSS específico do componente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Licencas() {
  const [licencas, setLicencas] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newLicenca, setNewLicenca] = useState({
    software: '',
    versao: '',
    computador: '',
    tipo_licenca: '',
    setor: '',
    serial: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLicenca((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addLicenca = (e) => {
    e.preventDefault();
    setLicencas((prev) => [...prev, newLicenca]);
    setNewLicenca({
      software: '',
      versao: '',
      computador: '',
      tipo_licenca: '',
      setor: '',
      serial: ''
    });
    setShowPopup(false);
  };

  return (
    <div className="licencas-container">
      <h1>Licenças</h1>
      <table className="licencas-table">
        <thead>
          <tr>
            <th>SOFTWARE</th>
            <th>VERSÃO</th>
            <th>COMPUTADOR</th>
            <th>TIPO DE LICENÇA</th>
            <th>SETOR</th>
            <th>SERIAL</th>
          </tr>
        </thead>
        <tbody>
          {licencas.map((item, index) => (
            <tr key={index}>
              <td>{item.software}</td>
              <td>{item.versao}</td>
              <td>{item.computador}</td>
              <td>{item.tipo_licenca}</td>
              <td>{item.setor}</td>
              <td>{item.serial}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={() => setShowPopup(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {showPopup && (
        <div className="popup-container">
          <div className="popup-form">
            <h2>Novo Item</h2>
            <form onSubmit={addLicenca}>
              <div className="form-group">
                <label htmlFor="software">SOFTWARE:</label>
                <input
                  type="text"
                  id="software"
                  name="software"
                  value={newLicenca.software}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="versao">VERSÃO:</label>
                <input
                  type="text"
                  id="versao"
                  name="versao"
                  value={newLicenca.versao}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="computador">COMPUTADOR:</label>
                <input
                  type="text"
                  id="computador"
                  name="computador"
                  value={newLicenca.computador}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipo_licenca">TIPO DE LICENÇA:</label>
                <input
                  type="text"
                  id="tipo_licenca"
                  name="tipo_licenca"
                  value={newLicenca.tipo_licenca}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="setor">SETOR:</label>
                <input
                  type="text"
                  id="setor"
                  name="setor"
                  value={newLicenca.setor}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="serial">SERIAL:</label>
                <input
                  type="text"
                  id="serial"
                  name="serial"
                  value={newLicenca.serial}
                  onChange={handleChange}
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setShowPopup(false)}>Cancelar</button>
                <button type="submit">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Licencas;
