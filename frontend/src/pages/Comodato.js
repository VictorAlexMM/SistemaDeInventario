import React, { useState, useEffect } from 'react';
import '../pages/Comodato.css'; // Importando o CSS para este componente

const Comodato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    centroCusto: '',
    setor: '',
    ativoFixo: '', // Campo para o hostname
    user: ''      // Campo para o nome do usuário
  });

  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        // Ajuste a URL para o endpoint correto
        const response = await fetch('http://mao-s38:3001/api/system-info');
        
        // Verifique se a resposta é válida
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const info = await response.json();
        
        // Atualiza os campos ativoFixo e user no formData
        setFormData(prevData => ({
          ...prevData,
          ativoFixo: info.hostname, // Preenche o campo com o hostname
          user: info.accountName // Preenche o campo com o nome da conta
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
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAgreed) {
      alert('Você deve concordar com as cláusulas antes de enviar o documento.');
      return;
    }
    console.log('Dados do Formulário:', formData);
  };

  return (
    <div className="comodato-container">
      <h1>COMODATO BRITÂNIA ELETRÔNICOS S.A</h1>
      <div className="comodato-content">
        <h2>CLÁUSULA 1° - Objeto:</h2>
        <p>
          1.1. Comodato do Direito de uso dos equipamentos mencionados no documento
        </p>
        <h2>CLÁUSULA 2° - Prazo de Duração</h2>
        <p>
          2.1. O prazo de duração do presente contrato é semelhante ao do contrato de trabalho ou de prestação do serviço firmado entre as partes, com início na data da assinatura do presente.
        </p>
        <h2>CLÁUSULA 3° - Das Responsabilidades dos Contratantes</h2>
        <p>
          3.1. Firmado o presente e na posse do equipamento, o COMODATÁRIO assume toda e qualquer responsabilidade pela conservação e guarda do equipamento que lhe é confiado.
        </p>
        <p>
          3.2. As manutenções de hardware, instalação de software e atualizações de sistema serão realizadas pela COMODANTE, a TI (Tecnologia da Informação).
        </p>
        <p>
          3.3. Responde o COMODATÁRIO, pela restituição imediata do valor constante da nota fiscal do equipamento comodatado, em casos de: roubos e furtos ocorridos por sua culpa, extravios, bem como, pelas despesas para reparo do equipamento em virtude de acidentes ou mau uso. Tal restituição poderá ocorrer mediante desconto em folha ou abatimento em notas fiscais de prestação de serviços.
        </p>
        <p>
          3.4. O valor de restituição conforme previsto na cláusula acima, será o valor da nota fiscal
        </p>

        <form onSubmit={handleSubmit} className="comodato-form">
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
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
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="centroCusto">Centro de Custo:</label>
            <input
              type="text"
              id="centroCusto"
              name="centroCusto"
              value={formData.centroCusto}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="setor">Setor:</label>
            <input
              type="text"
              id="setor"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="ativoFixo">Ativo Fixo:</label>
            <input
              type="text"
              id="ativoFixo"
              name="ativoFixo"
              value={formData.ativoFixo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="user">Usuário:</label>
            <input
              type="text"
              id="user"
              name="user"
              value={formData.user}
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
