import React, { useState, useEffect } from 'react';
import '../pages/Comodato.css';

const Comodato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    centroDeCusto: '',
    setor: '',
    patrimonio: '',
    user: ''      
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false); // Para controle de carregamento
  const [errorMessage, setErrorMessage] = useState(''); // Para mensagens de erro

  // Efeito para buscar informações do sistema
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
          user: info.accountName 
        }));
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    fetchSystemInfo();
  }, []);

  // Manipula mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manipula a mudança no checkbox de concordância
  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  // Manipula o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAgreed) {
      alert('Você deve concordar com as cláusulas antes de enviar o documento.');
      return;
    }

    // Verifique se os campos obrigatórios estão preenchidos
    if (!formData.nome || !formData.matricula || !formData.centroDeCusto || !formData.setor || !formData.patrimonio || !formData.user) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true); // Inicia o carregamento
    setErrorMessage(''); // Limpa mensagens de erro

    // Log do que está sendo enviado
    console.log('Dados enviados:', {
      nome: formData.nome,
      matricula: formData.matricula,
      centroDeCusto: formData.centroDeCusto,
      setor: formData.setor,
      patrimonio: formData.patrimonio,
      usuario: formData.user
    });

    try {
      const response = await fetch('http://localhost:5001/comodato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          matricula: formData.matricula,
          centroDeCusto: formData.centroDeCusto,
          setor: formData.setor,
          patrimonio: formData.patrimonio,
          usuario: formData.user
        }),
      });

      // Log da resposta do servidor
      console.log('Resposta do servidor:', response);

      if (!response.ok) {
        const errorText = await response.text(); // Captura o texto do erro
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado do servidor:', result);
      alert('Comodato enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar o comodato:', error);
      setErrorMessage('Erro ao enviar o comodato. Tente novamente.'); // Armazena a mensagem de erro
    } finally {
      setLoading(false); // Finaliza o carregamento
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

        {/* Formulário de comodato */}
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
            <label htmlFor="centroDeCusto">Centro de Custo:</label>
            <input
              type="text"
              id="centroDeCusto"
              name="centroDeCusto"
              value={formData.centroDeCusto}
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
            <label htmlFor="patrimonio">Patrimonio:</label>
            <input
              type="text"
              id="patrimonio"
              name="patrimonio"
              value={formData.patrimonio}
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