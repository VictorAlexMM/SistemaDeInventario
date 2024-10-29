import React, { useState, useEffect } from 'react';
import centrosDeCusto from '../data/centrosDeCusto.json'; // Importando o JSON
import '../pages/Comodato.css';

const Comodato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    centroDeCusto: '',
    setor: '',
    patrimonio: '',
    usuario: '' // Alterado de 'user' para 'usuario'
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLocations, setSelectedLocations] = useState({});
  const [comodatoType, setComodatoType] = useState('proprietario'); // Novo estado para tipo de comodato

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/system-info');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const info = await response.json();
        
        setFormData(prevData => ({
          ...prevData,
          patrimonio: info.hostname,
          usuario: info.accountName // Alterado de 'user' para 'usuario'
        }));
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    fetchSystemInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Atualiza o setor baseado no centro de custo selecionado
    if (name === 'centroDeCusto') {
      setFormData(prev => ({
        ...prev,
        setor: centrosDeCusto[value] || '' // Ajusta o setor baseado no centro de custo
      }));
    }
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const handleLocationChange = (e) => {
    const { value, checked } = e.target;
    setSelectedLocations(prev => ({
      ...prev,
      [value]: checked
    }));
  };

  const handleComodatoTypeChange = (e) => {
    setComodatoType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAgreed) {
      alert('Você deve concordar com as cláusulas antes de enviar o documento.');
      return;
    }

    const selectedPlants = Object.keys(selectedLocations).filter(key => selectedLocations[key]);
    if (selectedPlants.length === 0) {
      alert('Por favor, selecione ao menos uma planta.');
      return;
    }

    if (comodatoType === 'proprietario' && (!formData.nome || !formData.matricula || !formData.centroDeCusto || !formData.setor)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    console.log('Dados enviados:', {
      ...formData,
      planta: selectedPlants.join(', '), // Adicionando as plantas selecionadas
      locaisSelecionados: selectedPlants, // Pode ser mantido se necessário
      tipoComodato: comodatoType // Adicionando tipo de comodato
    });

    try {
      if (comodatoType === 'emprestado') {
        alert('Comodato enviado com sucesso!');
        // Aqui você pode adicionar lógica se precisar fazer algo específico para o tipo "emprestado"
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3003/comodato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          planta: selectedPlants.join(', '), // Enviando como string
          tipoComodato: comodatoType // Enviando tipo de comodato
        }),
      });

      console.log('Resposta do servidor:', response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error (`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado do servidor:', result);
      alert('Comodato enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar o comodato:', error);
      setErrorMessage('Erro ao enviar o comodato . Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comodato-container">
      <h1>COMODATO BRITÂNIA ELETRÔNICOS S.A</h1>
      <div className="comodato-content">
        {/* Exibição das cláusulas */}
        <h2>CLÁUSULA 1° - Objeto:</h2>
        <p>1.1. Comodato do Direito de uso dos equipamentos mencionados no documento</p>
        <h2>CLÁUSULA 2° - Prazo de Duração</h2>
        <p>2.1. O prazo de duração do presente contrato é semelhante ao do contrato de trabalho ou de prestação do serviço firmado entre as partes, com início na data da assinatura do presente.</p>
        <h2>CLÁUSULA 3° - Das Responsabilidades dos Contratantes</h2>
        <p>3.1. Firmado o presente e na posse do equipamento, o COMODATÁRIO assume toda e qualquer responsabilidade pela conservação e guarda do equipamento que lhe é confiado.</p>
        <p>3.2. As manutenções de hardware, instalação de software e atualizações de sistema serão realizadas pela COMODANTE, a TI (Tecnologia da Informação).</p>
        <p>3.3. Responde o COMODATÁRIO, pela restituição imediata do valor constante da nota fiscal do equipamento comodatado, em casos de: roubos e furtos ocorridos por sua culpa , extravios, bem como, pelas despesas para reparo do equipamento em virtude de acidentes ou mau uso. Tal restituição poderá ocorrer mediante desconto em folha ou abatimento em notas fiscais de prestação de serviços.</p>
        <p>3.4. O valor de restituição conforme previsto na cláusula acima, será o valor da nota fiscal</p>
        <form onSubmit={handleSubmit} className="comodato-form">
          <div className="form-group">
            <label>Tipo de Comodato:</label>
            <div>
              <input
                type="radio"
                id="proprietario"
                value="proprietario"
                checked={comodatoType === 'proprietario'}
                onChange={handleComodatoTypeChange}
              />
              <label htmlFor="proprietario">Proprietário</label>
            </div>
            <div>
              <input
                type="radio"
                id="emprestado"
                value="emprestado"
                checked={comodatoType === 'emprestado'}
                onChange={handleComodatoTypeChange}
              />
              <label htmlFor="emprestado">Emprestado</label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required={comodatoType === 'proprietario'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="matricula">Matrícula:</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              required={comodatoType === 'proprietario'}
            />
          </div>
          <div className="form-group">
            <label>Planta:</label>
            {['Joinville', 'Manaus', 'Curitiba', 'Linhares'].map(location => (
              <div key={location}>
                <input
                  type="checkbox"
                  id={location}
                  value={location}
                  checked={!!selectedLocations[location]}
                  onChange={handleLocationChange}
                />
                <label htmlFor={location}>{location}</label>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="centroDeCusto">Centro de Custo:</label>
            <input
              type="text"
              id="centroDeCusto"
              name="centroDeCusto"
              value={formData.centroDeCusto}
              onChange={handleChange}
              required={comodatoType === 'proprietario'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="setor">Setor:</label>
            <input
              type="text"
              id="setor"
              name="setor"
              value={formData.setor}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="patrimonio">Patrimônio:</label>
            <input
              type="text"
              id="patrimonio"
              name="patrimonio"
              value={formData.patrimonio}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="usuario">Usuário:</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              readOnly
            />
          </div>
          <div className="form-group agreement">
            <input
              type="checkbox"
              id="agreement"
              checked={isAgreed}
              onChange={handleAgreementChange}
              required
            />
            <label htmlFor="agreement">
              Ao enviar esse documento você concorda com as Cláusulas citadas
            </label>
          </div>
          <button type="submit" className="submit-button">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default Comodato;