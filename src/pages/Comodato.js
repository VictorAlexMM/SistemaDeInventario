import React from 'react';
import '../pages/Comodato.css'; // Importando o CSS para este componente

const Comodato = () => {
  return (
    <div className="comodato-container">
      <h1>Aviso de Comodato</h1>
      <div className="comodato-content">
        <h2>CLÁUSULA 2° - Prazo de Duração</h2>
        <p>
          2.1. O prazo de duração do presente COMODATO é igual ao prazo do contrato de trabalho ou de prestação de serviços firmado entre as partes.
        </p>
        <p>
          2.2. Ao fim do Contrato de trabalho ou do Contrato de prestação de serviços, o COMODATÁRIO deverá devolver os equipamentos acima descritos no estado em que os recebeu.
        </p>

        <h2>CLÁUSULA 3° - Das Responsabilidades dos Contratantes</h2>
        <p>
          3.1. Firmado o presente e na posse do equipamento, o COMODATÁRIO assume toda e qualquer responsabilidade pela conservação e guarda do equipamento que lhe é confiado.
        </p>
        <p>
          3.2. As manutenções de hardware, instalação de software e atualizações de sistema serão realizadas pela COMODANTE, a TI (Tecnologia da Informação).
        </p>
        <p>
          3.3. Responde o COMODATÁRIO, pela restituição imediata do valor constante da nota fiscal do equipamento comodatado, em casos de: roubos e furtos sem apresentação do respectivo Boletim de Ocorrência, extravios por ele causados, bem como, pelas despesas para reparo do equipamento em virtude de acidentes ou mau uso. Tal restituição poderá ocorrer mediante desconto em folha ou abatimento em notas fiscais de prestação de serviços, o que fica desde já expressamente autorizado pelo Comodatário.
        </p>
        <p>
          3.4. O valor de restituição conforme previsto na cláusula acima, será o valor da nota fiscal do equipamento, descontando-se a depreciação do ativo.
        </p>

        <p className="footer-text">
          E por estarem justos e contratados, COMODANTE e COMODATÁRIO, firmam o presente em 2 (duas) vias de igual teor e forma, para que produza os seus efeitos legais de direito.
        </p>
      </div>
    </div>
  );
};

export default Comodato;
