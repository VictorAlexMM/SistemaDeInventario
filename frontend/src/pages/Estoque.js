import React, { useState, useEffect } from 'react'; // Adicione useEffect aqui
import '../pages/Estoque.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faEdit, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import centroDeCusto from '../data/centrosDeCusto.json';
import { getCookie } from '../utils/cookieUtils';


function Estoque() {
  const [estoque, setEstoque] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [downloadOption, setDownloadOption] = useState('completo');
  const [newEstoque, setNewEstoque] = useState({
    patrimonio: '',
    empresa: '',
    setor: '',
    centroDeCusto: '',
    tipo: '',
    marca: '',
    modelo: '',
    office: '',
    compartilhada: false,
    usuarios: '',
    planta: '',
    tipoCompra: '',
    fornecedor: '',
    nf: '',
    dataNf: '',
    valorUnitario: '',
    dataRecebimento: '',
    chamadoFiscal: '',
    dataEntradaFiscal: '',
    chamadoNext: '',
    dataNext: '',
    entradaContabil: '',
    garantia: '',
    comodato: false, 
    criadoPor:'',
    dataCriacao: '',
    dataModificacao: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'patrimonio', direction: 'asc' });
  const [sortCriteria, setSortCriteria] = useState('dataCriacao'); 
  const [sortOrder, setSortOrder] = useState('asc','desc'); // ou 'desc'


  const filteredEstoque = estoque.filter(item =>
    item.patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.centroDeCusto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.planta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.usuarios.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortData = (data, criteria, order) => {
    return data.slice().sort((a, b) => {
      if (criteria === 'dataCriacao' || criteria === 'dataModificacao') {
        const dateA = new Date(a[criteria]);
        const dateB = new Date(b[criteria]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (criteria === 'patrimonio') {
        const patrimonioA = a[criteria].toUpperCase();
        const patrimonioB = b[criteria].toUpperCase();
        return order === 'asc' ? patrimonioA.localeCompare(patrimonioB) : patrimonioB.localeCompare(patrimonioA);
      }
      return 0;
    });
  };
  const downloadByPeriod = () => {
    // Lógica para exportar o CSV por período
    alert('Exportando CSV por período (implementação necessária).');
    // Aqui você pode incluir a lógica de geração e download do CSV por período
  }; 

  const handleDownload = () => {
    if (downloadOption === 'completo') {
      downloadFilledCSV(); // Chama a função para exportar CSV completo
    } else {
      downloadByPeriod(); // Chama a função para exportar CSV por período
    }
    setIsExporting(false); // Fecha o popup após o download
  };
  
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredEstoque];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [filteredEstoque, sortConfig]);

  useEffect(() => {
    // Atualiza o setor quando o centro de custo mudar
    const setor = centroDeCusto[newEstoque.centroDeCusto] || '';
    setNewEstoque(prevState => ({ ...prevState, setor }));
  }, [newEstoque.centroDeCusto]);

  useEffect(() => {
    // Atualiza o campo criadoPor com o valor do cookie ao montar o componente
    const usuarioLogado = getCookie('username');
    setNewEstoque(prevState => ({
      ...prevState,
      criadoPor: usuarioLogado
    }));
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEstoque(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  function requestSort(key) {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    }

  const getClassNameForSort = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 'asc' : 'desc';
    }
    return '';
  };

  const addOrUpdateEstoque = (e) => {
    e.preventDefault();

    const saveEstoqueToServer = async (item) => {
      try {
        const response = await fetch('/api/estoque', {
          method: editingIndex !== null ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        if (!response.ok) {
          throw new Error('Erro ao salvar no servidor.');
        }
        return await response.json();
      } catch (error) {
        alert(error.message);
        console.error(error);
      }
    };
    
    const now = new Date().toISOString(); // Obtém a data e hora atual

    // Verifica se o patrimônio já existe no estoque e não está em modo de edição
    if (estoque.some(item => item.patrimonio === newEstoque.patrimonio && editingIndex === null)) {
      alert('Item com este patrimônio já existe.');
      return;
    }
    // Verifica se o centro de custo está certo
    if (!centroDeCusto[newEstoque.centroDeCusto]) {
      alert('Centro de Custo inválido.');
      return;
    }
    if (editingIndex !== null) {
      setEstoque((prev) => {
        const updated = [...prev];
        updated[editingIndex] = { 
          ...updated[editingIndex], 
          ...newEstoque,
          dataModificacao: now,
          criadoPor: updated[editingIndex].criadoPor // Mantém o valor original de criadoPor
        };
        return updated;
      });
      setEditingIndex(null);
    } else {
      // Adiciona um novo item com dataCriacao
      setEstoque((prev) => [...prev, { ...newEstoque, dataCriacao: now }]);
    }

    // Reseta o estado do novo item e fecha o formulário
    setNewEstoque({
      patrimonio: '',
      empresa: '',
      setor: '',
      centroDeCusto: '',
      tipo: '',
      marca: '',
      modelo: '',
      office: '',
      compartilhada: false,
      usuarios: '',
      planta: '',
      tipoCompra: '',
      fornecedor: '',
      nf: '',
      dataNf: '',
      valorUnitario: '',
      dataRecebimento: '',
      chamadoFiscal: '',
      dataEntradaFiscal: '',
      chamadoNext: '',
      dataNext: '',
      entradaContabil: '',
      garantia: '',
      comodato: false,  // Atualizado para false por padrão
      criadoPor:getCookie('username'),
      dataCriacao: '',  // Resetar o campo de data de criação
      dataModificacao: ''  // Resetar o campo de data de modificação
    });
    setIsAdding(false);
  };

  const handleEdit = (index) => {
    setNewEstoque(estoque[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };
  
  const handleImport = (e) => {
    e.preventDefault();

    if (!csvFile) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const csvData = results.data;

        // Formata os dados do CSV
        const formattedData = csvData.map(item => {
          const setor = centroDeCusto[item['Centro de Custo']] || '';

          return {
            patrimonio: item.Patrimônio || '',
            empresa: item.Empresa || '',
            setor: setor,
            centroDeCusto: item['Centro de Custo'] || '',
            tipo: item.Tipo || '',
            marca: item.Marca || '',
            modelo: item.Modelo || '',
            office: item.Office || '',
            compartilhada: item.Compartilhada === 'Sim' ? 'Sim' : 'Não',
            usuarios: item.Usuários || '',
            planta: item.Planta || '',
            tipoCompra: item['Tipo Compra'] || '',
            fornecedor: item.Fornecedor || '',
            nf: item.NF || '',
            dataNf: item['Data NF'] || '',
            valorUnitario: item['Valor Unitário'] || '',
            dataRecebimento: item['Data Recebimento'] || '',
            chamadoFiscal: item['Chamado Fiscal'] || '',
            dataEntradaFiscal: item['Data Entrada Fiscal'] || '',
            chamadoNext: item['Chamado Next'] || '',
            dataNext: item['Data Next'] || '',
            entradaContabil: item['Entrada Contábil'] || '',
            garantia: item.Garantia || '',
            comodato: item.Comodato === 'Sim' ? 'Sim' : 'Não',
            criadoPor: getCookie('username') || '',
            dataCriacao: '',  // Não importar a dataCriacao do CSV para não sobrescrever
            dataModificacao: ''  // Não importar dataModificacao
          };
        });

        // Cria um mapa para evitar duplicidade e manter dados atualizados
        const estoqueMap = new Map(estoque.map(item => [item.patrimonio, item]));

        // Adiciona ou atualiza os itens no mapa
        formattedData.forEach(item => {
          const currentDate = new Date().toISOString();
          if (!estoqueMap.has(item.patrimonio)) {
            estoqueMap.set(item.patrimonio, { ...item, dataCriacao: currentDate });
          } else {
            const existingItem = estoqueMap.get(item.patrimonio);
            estoqueMap.set(item.patrimonio, { ...existingItem, ...item, dataModificacao: currentDate });
          }
        });

        // Atualiza o estado com os dados não duplicados
        setEstoque(Array.from(estoqueMap.values()));
        setIsImporting(false);
      },
      error: (error) => {
        alert('Erro ao importar o arquivo CSV.');
        console.error(error);
      }
    });
  };

  const downloadExampleCSV = () => {
    // Cabeçalhos das colunas para o exemplo
    const csvHeader = [
      'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
      'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
      'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
      'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia','Comodato'
    ].map(header => `"${header}"`).join(',') + '\n';

    // Conteúdo do CSV (sem dados, apenas cabeçalhos)
    const csvContent = csvHeader;

    // Codifica a URI do CSV com UTF-8
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,\uFEFF${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exemplo_inventário.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFilledCSV = () => {
    if (estoque.length === 0) {
      alert('Não há dados preenchidos para exportar.');
      return;
    }

    // Cabeçalhos das colunas
    const csvHeader = [
      'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
      'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
      'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
      'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia','Comodato', 'Data Criação', 'Data Modificação'
    ].map(header => `"${header}"`).join(',') + '\n';

    // Linhas de dados
    const csvRows = estoque.map(item =>
      [
        item.patrimonio, item.empresa, item.setor, item.centroDeCusto, item.tipo, 
        item.marca, item.modelo, item.office, item.compartilhada ? 'Sim' : 'Não',
        item.usuarios, item.planta, item.tipoCompra, item.fornecedor, item.nf,
        item.dataNf, item.valorUnitario, item.dataRecebimento, item.chamadoFiscal,
        item.dataEntradaFiscal, item.chamadoNext, item.dataNext, item.entradaContabil, item.garantia,item.comodato ? 'Sim' : 'Não',
        item.dataCriacao, item.dataModificacao
      ].map(value => `"${(value || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Conteúdo do CSV
    const csvContent = csvHeader + csvRows;

    // Codifica a URI do CSV com UTF-8
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,\uFEFF${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventário.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetNewEstoque = () => {
    setNewEstoque({
      patrimonio: '',
      empresa: '',
      setor: '',
      centroDeCusto: '',
      tipo: '',
      marca: '',
      modelo: '',
      office: '',
      compartilhada: false,
      usuarios: '',
      planta: '',
      tipoCompra: '',
      fornecedor: '',
      nf: '',
      dataNf: '',
      valorUnitario: '',
      dataRecebimento: '',
      chamadoFiscal: '',
      dataEntradaFiscal: '',
      chamadoNext: '',
      dataNext: '',
      entradaContabil: '',
      garantia: '',
      comodato: false,
      criadoPor: getCookie('username') || '',
      dataCriacao: '',  // Resetar o campo de data de criação
      dataModificacao: ''  // Resetar o campo de data de modificação
    });
    setIsAdding(false);
  };

  return (
    <div>
      <h1>Inventário</h1>
      <div className="form-buttons">
        <input 
          className='search-container'
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar"
        />
        <button type="button" className="button-import" onClick={() => setIsImporting(true)}>
          <FontAwesomeIcon icon={faUpload} /> Importar CSV
        </button>
        <button type="button" className="button-export" onClick={downloadFilledCSV}>
          Exportar CSV
        </button>
        <button type="button" className="button-add" onClick={() => {
          resetNewEstoque();
          setEditingIndex(null);
          setIsAdding(true);
        }}>
          <FontAwesomeIcon icon={faPlus} /> Adicionar Item
        </button>
      </div>
      <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => { setSortCriteria('patrimonio'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
              Patrimônio {sortCriteria === 'patrimonio' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th>Empresa</th>
            <th>Setor</th>
            <th>Centro de Custo</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Office</th>
            <th>Compartilhada</th>
            <th>Usuários</th>
            <th>Planta</th>
            <th onClick={() => { setSortCriteria('dataCriacao'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
              Data Criação {sortCriteria === 'dataCriacao' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th>Data Modificação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
      {sortData(filteredEstoque, sortCriteria, sortOrder).map((item, index) => (
        <React.Fragment key={index}>
          <tr>
            <td>{item.patrimonio}</td>
            <td>{item.empresa}</td>
            <td>{item.setor}</td>
            <td>{item.centroDeCusto}</td>
            <td>{item.tipo}</td>
            <td>{item.marca}</td>
            <td>{item.modelo}</td>
            <td>{item.office}</td>
            <td>{item.compartilhada ? 'Sim' : 'Não'}</td>
            <td>{item.usuarios}</td>
            <td>{item.planta}</td>
            <td>{new Date(item.dataCriacao).toLocaleString()}</td>
            <td>{item.dataModificacao ? new Date(item.dataModificacao).toLocaleString() : '-'}</td>
            <td>
              <button onClick={() => handleEdit(index)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="collapsible-button" onClick={() => setIsCollapsibleOpen(index === isCollapsibleOpen ? null : index)}>
                <FontAwesomeIcon icon={isCollapsibleOpen === index ? faChevronUp : faChevronDown} />
              </button>
            </td>
          </tr>
          {isCollapsibleOpen === index && (
            <tr>
              <td colSpan="14">
                <div className="collapsible-content">
                  <p><strong>Detalhes Adicionais:</strong></p>
                  <table>
                    <tbody>
                      <tr>
                        <td><strong>Tipo Compra:</strong></td>
                        <td>{item.tipoCompra}</td>
                      </tr>
                      <tr>
                        <td><strong>Fornecedor:</strong></td>
                        <td>{item.fornecedor}</td>
                      </tr>
                      <tr>
                        <td><strong>NF:</strong></td>
                        <td>{item.nf}</td>
                      </tr>
                      <tr>
                        <td><strong>Data NF:</strong></td>
                        <td>{item.dataNf}</td>
                      </tr>
                      <tr>
                        <td><strong>Valor Unitário:</strong></td>
                        <td>{item.valorUnitario}</td>
                      </tr>
                      <tr>
                        <td><strong>Data Recebimento:</strong></td>
                        <td>{item.dataRecebimento}</td>
                      </tr>
                      <tr>
                        <td><strong>Chamado Fiscal:</strong></td>
                        <td>{item.chamadoFiscal}</td>
                      </tr>
                      <tr>
                        <td><strong>Data Entrada Fiscal:</strong></td>
                        <td>{item.dataEntradaFiscal}</td>
                      </tr>
                      <tr>
                        <td><strong>Chamado Next:</strong></td>
                        <td>{item.chamadoNext}</td>
                      </tr>
                      <tr>
                        <td><strong>Data Next:</strong></td>
                        <td>{item.dataNext}</td>
                      </tr>
                      <tr>
                        <td><strong>Entrada Contábil:</strong></td>
                        <td>{item.entradaContabil}</td>
                      </tr>
                      <tr>
                        <td><strong>Garantia:</strong></td>
                        <td>{item.garantia}</td>
                      </tr>
                      <tr>
                        <td><strong>Comodato:</strong></td>
                        <td>{item.comodato === 'Sim' ? 'Sim' : 'Não'}</td>
                      </tr>
                      <tr>
                        <td><strong>Criado Por:</strong></td>
                        <td>{item.criadoPor}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>



      {isAdding && (
  <div className="add-edit-form-modal">
    <form onSubmit={addOrUpdateEstoque}>
      <label>
        Patrimônio:
        <input
          type="text"
          name="patrimonio"
          value={newEstoque.patrimonio}
          onChange={handleChange}
          required
          disabled={editingIndex !== null}
        />
      </label>
      <label>
        Empresa:
        <input
          type="text"
          name="empresa"
          value={newEstoque.empresa}
          onChange={handleChange}
        />
      </label>
      <label>
        Setor:
        <input
          type="text"
          name="setor"
          value={newEstoque.setor}
          readOnly
        />
      </label>
      <label>
        Centro de Custo:
        <input
          type="text"
          name="centroDeCusto"
          value={newEstoque.centroDeCusto}
          onChange={handleChange}
        />
      </label>
      <label>
        Tipo:
        <input
          type="text"
          name="tipo"
          value={newEstoque.tipo}
          onChange={handleChange}
        />
      </label>
      <label>
        Marca:
        <input
          type="text"
          name="marca"
          value={newEstoque.marca}
          onChange={handleChange}
        />
      </label>
      <label>
        Modelo:
        <input
          type="text"
          name="modelo"
          value={newEstoque.modelo}
          onChange={handleChange}
        />
      </label>
      <label>
        Office:
        <input
          type="text"
          name="office"
          value={newEstoque.office}
          onChange={handleChange}
        />
      </label>
      <label>
        Compartilhada:
        <select
          name="compartilhada"
          value={newEstoque.compartilhada== 'Sim' ? 'Sim' : 'Não'}
          onChange={handleChange}
        >
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </label>
      <label>
        Usuários:
        <input
          type="text"
          name="usuarios"
          value={newEstoque.usuarios}
          onChange={handleChange}
        />
      </label>
      <label>
        Planta:
        <input
          type="text"
          name="planta"
          value={newEstoque.planta}
          onChange={handleChange}
        />
      </label>
      <label>
        Tipo Compra:
        <input
          type="text"
          name="tipoCompra"
          value={newEstoque.tipoCompra}
          onChange={handleChange}
        />
      </label>
      <label>
        Fornecedor:
        <input
          type="text"
          name="fornecedor"
          value={newEstoque.fornecedor}
          onChange={handleChange}
        />
      </label>
      <label>
        NF:
        <input
          type="text"
          name="nf"
          value={newEstoque.nf}
          onChange={handleChange}
        />
      </label>
      <label>
        Data NF:
        <input
          type="date"
          name="dataNf"
          value={newEstoque.dataNf}
          onChange={handleChange}
        />
      </label>
      <label>
        Valor Unitário:
        <input
          type="text"
          name="valorUnitario"
          value={newEstoque.valorUnitario}
          onChange={handleChange}
        />
      </label>
      <label>
        Data Recebimento:
        <input
          type="date"
          name="dataRecebimento"
          value={newEstoque.dataRecebimento}
          onChange={handleChange}
        />
      </label>
      <label>
        Chamado Fiscal:
        <input
          type="text"
          name="chamadoFiscal"
          value={newEstoque.chamadoFiscal}
          onChange={handleChange}
        />
      </label>
      <label>
        Data Entrada Fiscal:
        <input
          type="date"
          name="dataEntradaFiscal"
          value={newEstoque.dataEntradaFiscal}
          onChange={handleChange}
        />
      </label>
      <label>
        Chamado Next:
        <input
          type="text"
          name="chamadoNext"
          value={newEstoque.chamadoNext}
          onChange={handleChange}
        />
      </label>
      <label>
        Data Next:
        <input
          type="date"
          name="dataNext"
          value={newEstoque.dataNext}
          onChange={handleChange}
        />
      </label>
      <label>
        Entrada Contábil:
        <input
          type="text"
          name="entradaContabil"
          value={newEstoque.entradaContabil}
          onChange={handleChange}
        />
      </label>
      <label>
        Garantia:
        <input
          type="text"
          name="garantia"
          value={newEstoque.garantia}
          onChange={handleChange}
        />
      </label>
      <label>
          Criado Por:
          <input
            type="text"
            name="criadoPor"
            value={newEstoque.criadoPor}
            readOnly // Tornar o campo somente leitura se não desejar que o usuário edite
          />
        </label>
      <label>
        Comodato:
        <select
          name="comodato"
          value={newEstoque.comodato == 'Sim' ? 'Sim' : 'Não'}
          onChange={handleChange}
        >
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </label>
      <div className="button-container">
        <button type="submit" className="submit">
          {editingIndex !== null ? 'Atualizar' : 'Adicionar'}
        </button>
        <button type="button" className="cancel" onClick={() => setIsAdding(false)}>
          Cancelar
        </button>
      </div>
    </form>
    </div>
   )}

      {isExporting && (
        <div className="export-popup">
          <h2>Exportar CSV</h2>
          <label>
            <select onChange={(e) => setDownloadOption(e.target.value)} value={downloadOption}>
              <option value="completo">CSV Completo</option>
              <option value="periodo">CSV por Período</option>
            </select>
          </label>
          <div className="button-container">
            <button onClick={handleDownload}>Baixar</button>
            <button onClick={() => setIsExporting(false)}>Cancelar</button>
          </div>
        </div>
      )}


      {/* Importação CSV */}
      {isImporting && (
        <div className="import-csv-modal">
            <form onSubmit={handleImport}>
              <label>
                Selecione o arquivo CSV:
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
              </label>
              <button type="submit">Importar</button>
              <button type="button" onClick={() => setIsImporting(false)}>Cancelar</button>
              <button type="button" onClick={downloadExampleCSV}>
                Baixar Exemplo CSV
              </button>
            </form>
        </div>
      )}
    </div>
  );
}

export default Estoque;
