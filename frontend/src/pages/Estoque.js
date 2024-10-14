import React, { useState, useEffect } from 'react';
import '../pages/Estoque.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faEdit, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import centroDeCusto from '../data/centrosDeCusto.json';
import { getCookie } from '../utils/cookieUtils';
import moment from 'moment'; 
import axios from 'axios';

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
    compartilhada: 'Não',
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
    comodato: 'Não',
    criadoPor: '',
    dataCriacao: '',
    dataModificacao: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'patrimonio', direction: 'asc' });
  const [sortCriteria, setSortCriteria] = useState('dataCriacao');
  const [sortOrder, setSortOrder] = useState('asc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get('http://localhost:5001/inventario');
      const data = response.data;
      const filteredData = data.filter(item => {
        const createdAt = moment(item.dataCriacao);
        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      const csvData = filteredData.map(item => {
        return {
          Patrimonio: item.patrimonio,
          Empresa: item.empresa,
          Setor: item.setor,
          CentroDeCusto: item.centroDeCusto,
          Tipo: item.tipo,
          Marca: item.marca,
          Modelo: item.modelo,
          Office: item.office,
          Compartilhada: item.compartilhada,
          Usuarios: item.usuarios,
          Planta: item.planta,
          TipoCompra: item.tipoCompra,
          Fornecedor: item.fornecedor,
          NF: item.nf,
          DataNF: moment(item.dataNf).format('DD/MM/YYYY'),
          ValorUnitario: item.valorUnitario,
          DataRecebimento: moment(item.dataRecebimento).format('DD/MM/YYYY'),
          ChamadoFiscal: item.chamadoFiscal,
          DataEntradaFiscal: moment(item.dataEntradaFiscal).format('DD/MM/YYYY'),
          ChamadoNext: item.chamadoNext,
          DataNext: moment(item.dataNext).format('DD/MM/YYYY'),
          EntradaContabil: item.entradaContabil,
          Garantia: item.garantia,
          Comodato: item.comodato,
          CriadoPor: item.criadoPor,
          DataCriacao: moment(item.dataCriacao).format('DD/MM/YYYY'),
          DataModificacao: moment(item.dataModificacao).format('DD/MM/YYYY')
        };
      });
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estoque.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const filteredEstoque = estoque.filter(item =>
    item.patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.centroDeCusto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo .toLowerCase().includes(searchTerm.toLowerCase()) ||
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


  const handleDownload = async () => {
    if (downloadOption === 'completo') {
      downloadFilledCSV();
    } else if (downloadOption === 'periodo') {
      downloadByPeriod();
    }
  };
  
  const downloadByPeriod = async () => {
    try {
      const response = await axios.get('http://localhost:5001/inventario');
      const data = response.data;
      const filteredData = data.filter(item => {
        const createdAt = moment(item.dataCriacao);
        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      const csvData = filteredData.map(item => {
        return {
          Patrimonio: item.patrimonio,
          Empresa: item.empresa,
          Setor: item.setor,
          CentroDeCusto: item.centroDeCusto,
          Tipo: item.tipo,
          Marca: item.marca,
          Modelo: item.modelo,
          Office: item.office,
          Compartilhada: item.compartilhada,
          Usuarios: item.usuarios,
          Planta: item.planta,
          TipoCompra: item.tipoCompra,
          Fornecedor: item.fornecedor,
          NF: item.nf,
          DataNF: moment(item.dataNf).format('DD/MM/YYYY'),
          ValorUnitario: item.valorUnitario,
          DataRecebimento: moment(item.dataRecebimento).format('DD/MM/YYYY'),
          ChamadoFiscal: item.chamadoFiscal,
          DataEntradaFiscal: moment(item.dataEntradaFiscal).format('DD/MM/YYYY'),
          ChamadoNext: item.chamadoNext,
          DataNext: moment(item.dataNext).format('DD/MM/YYYY'),
          EntradaContabil: item.entradaContabil,
          Garantia: item.garantia,
          Comodato: item.comodato,
          CriadoPor: item.criadoPor,
          DataCriacao: moment(item.dataCriacao).format('DD/MM/YYYY'),
          DataModificacao: moment(item.dataModificacao).format('DD/MM/YYYY')
        };
      });
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estoque.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
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
    setNewEstoque(prevState => ({ ...prevState, criadoPor: getCookie('username') }));
  }, [getCookie('username')]);

  useEffect(() => {
    const setor = centroDeCusto[newEstoque.centroDeCusto] || '';
    setNewEstoque(prevState => ({ ...prevState, setor }));
  }, [newEstoque.centroDeCusto]);

 const getEstoque = async () => {
    try {
      const response = await axios.get('http://localhost:5001/inventario');
      setEstoque(response.data);
    } catch (error) {
      console.error('Erro ao obter os dados:', error);
    }
  };

  useEffect(() => {
    getEstoque();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'compartilhada' || name === 'comodato') {
      setNewEstoque(prev => ({ ...prev, [name]: checked ? 'Sim' : 'Não' }));
    } else {
      setNewEstoque(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const compartilhada = newEstoque.compartilhada === 'Sim' ? 'Sim' : 'Não';
      const comodato = newEstoque.comodato === 'Sim' ? 'Sim' : 'Não';
      const method = editingIndex !== null ? 'put' : 'post';
      const url = editingIndex !== null ? `http://localhost:5001/inventario/${newEstoque.patrimonio}` : 'http://localhost:5001/inventario';
      const dataNf = moment(newEstoque.dataNf).format('YYYY-MM-DD');
      const dataRecebimento = moment(newEstoque.dataRecebimento).format('YYYY-MM-DD');
      const dataEntradaFiscal = moment(newEstoque.dataEntradaFiscal).format('YYYY-MM-DD');
      const dataNext = moment(newEstoque.dataNext).format('YYYY-MM-DD');
  
      const data = {
        ...newEstoque,
        compartilhada: compartilhada,
        comodato: comodato,
        dataNf: dataNf,
        dataRecebimento: dataRecebimento,
        dataEntradaFiscal: dataEntradaFiscal,
        dataNext: dataNext
      };
  
      const response = await axios[method](url, data);
      alert(response.data.message);
      setNewEstoque({});
      setIsAdding(false); // Adicione essa linha para fechar o formulário após o envio
      getEstoque(); // Adicione essa linha para atualizar a lista de estoque após o envio
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao enviar os dados.';
      alert(errorMessage);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getClassNameForSort = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 'asc' : 'desc';
    }
    return '';
  };

  const handleEdit = (index) => {
    setNewEstoque(estoque[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
  
    if (!csvFile) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }
  
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const csvData = results.data;
  
        console.log('Dados recebidos:', csvData);
  
        const formattedData = csvData.map(item => {
          const setor = centroDeCusto[item['Centro de Custo']] || '';
  
          // Convert dates to ISO format
          const dataNfIso = item['Data NF'] ? moment(item['Data NF'], 'DD/MM/YYYY', true).toISOString() : '';
          const dataRecebimentoIso = item['Data Recebimento'] ? moment(item['Data Recebimento'], 'DD/MM/YYYY', true).toISOString() : '';
          const dataEntradaFiscalIso = item['Data Entrada Fiscal'] ? moment(item['Data Entrada Fiscal'], 'DD/MM/YYYY', true).toISOString() : '';
          const dataNextIso = item['Data Next'] ? moment(item['Data Next'], 'DD/MM/YYYY', true).toISOString() : '';
  
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
            dataNf: dataNfIso,
            valorUnitario: item['Valor Unitário'] || '',
            dataRecebimento: dataRecebimentoIso,
            chamadoFiscal: item['Chamado Fiscal'] || '',
            dataEntradaFiscal: dataEntradaFiscalIso,
            chamadoNext: item['Chamado Next'] || '',
            dataNext: dataNextIso,
            entradaContabil: item['Entrada Contábil'] || '',
            garantia: item.Garantia || '',
            comodato: item.Comodato === 'Sim' ? 'Sim' : 'Não',
            criadoPor: getCookie('username') || '',
            dataModificacao: ''
          };
        });
  
        // Verifique os dados
        if (!formattedData.every(item => item.patrimonio && item.empresa && item.setor && item.centroDeCusto)) {
          alert('Erro: Dados inválidos. Por favor, verifique os dados e tente novamente.');
          return;
        }
  
        try {
          const response = await axios.post('http://localhost:50010/inventario/importar', formattedData);
          console.log('Dados importados com sucesso:', response.data);
          alert('Dados importados com sucesso!');
          getEstoque();
        } catch (error) {
          console.error('Erro ao importar os dados:', error);
          if (error.response) {
            alert(`Erro ${error.response.status}: ${error.response.data.message}`);
          } else {
            alert('Erro ao importar os dados. Por favor, tente novamente.');
          }
        }
      },
      error: (error) => {
        alert('Erro ao importar o arquivo CSV.');
        console.error(error);
      }
    });
  };
  const downloadExampleCSV = () => {
    const csvHeader = [
      'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
      'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
      'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
      'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia','Comodato'
    ].map(header => `"${header}"`).join(',') + '\n';

    const csvContent = csvHeader;

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

    const csvHeader = [
      'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
      'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
      'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
      'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia','Comodato', 'Data Criação', 'Data Modificação'
    ].map(header => `"${header}"`).join(',') + '\n';

    const csvRows = estoque.map(item =>
      [
        item.patrimonio, item.empresa, item.setor, item.centroDeCusto, item.tipo,
        item.marca, item.modelo, item.office, item.compartilhada ? 'Sim' : 'Não',
        item.usuarios, item.planta, item.tipoCompra, item.fornecedor, item.nf,
        item.dataNf, item.valorUnitario, item.dataRecebimento, item.chamadoFiscal,
        item.dataEntradaFiscal, item.chamadoNext, item.dataNext, item.entradaContabil, item.garantia,item.comodato ? 'Sim' : 'Não',
        moment(item.dataCriacao).format('YYYY-MM-DD'), moment(item.dataModificacao).format('YYYY-MM-DD')
      ].map(value => `"${(value || '').replace(/"/g, '""') }"`).join(',')
    ).join('\n');

    const csvContent = csvHeader + csvRows;

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
      dataCriacao: '',
      dataModificacao: ''
    });
    setIsAdding(false);
  };

  const now = new Date().toISOString();

  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };

  return (
      <div className="estoque-container">
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
        <button type="button" className="button-export" onClick={() => setIsExporting(true)}>
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
                  <td>{formatDate(item.dataCriacao)}</td>
                  <td>{item.dataModificacao ? formatDate(item.dataModificacao) : '-'}</td>
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
                              <td>{ item.tipoCompra}</td>
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
                              <td>{formatDate(item.dataNf)}</td>
                            </tr>
                            <tr>
                              <td><strong>Valor Unitário:</strong></td>
                              <td>{item.valorUnitario}</td>
                            </tr>
                            <tr>
                              <td><strong>Data Recebimento:</strong></td>
                              <td>{formatDate(item.dataRecebimento)}</td>
                            </tr>
                            <tr>
                              <td><strong>Chamado Fiscal:</strong></td>
                              <td>{item.chamadoFiscal}</td>
                            </tr>
                            <tr>
                              <td><strong>Data Entrada Fiscal:</strong></td>
                              <td>{formatDate(item.dataEntradaFiscal)}</td>
                            </tr>
                            <tr>
                              <td><strong>Chamado Next:</strong></td>
                              <td>{item.chamadoNext}</td>
                            </tr>
                            <tr>
                              <td><strong>Data Next:</strong></td>
                              <td>{formatDate(item.dataNext)}</td>
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
                            <td><strong>Criado Por:</strong> {item.criadoPor}</td>
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
          <form onSubmit={handleSubmit}>
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
                value={newEstoque.compartilhada}
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
                value={moment(newEstoque.dataNf).format('YYYY-MM-DD')}
                onChange={handleChange}
              />
            </label>
            <label>
              Valor Unitário:
              <input
                type="number"
                step="0.01"
                name="valorUnitario"
                value={newEstoque.valorUnitario}
                onChange ={handleChange}
              />
            </label>
            <label>
              Data Recebimento:
              <input
                type="date"
                name="dataRecebimento"
                value={moment(newEstoque.dataRecebimento).format('YYYY-MM-DD')}
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
                value={moment(newEstoque.dataEntradaFiscal).format('YYYY-MM-DD')}
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
                value={moment(newEstoque.dataNext).format('YYYY-MM-DD')}
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
              Comodato:
              <select
                name="comodato"
                value={newEstoque.comodato}
                onChange={handleChange}
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </label>
            <label>
              Criado Por:
              <input
                type="text"
                name="criadoPor"
                onChange={handleChange}
              />
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
          {downloadOption === 'periodo' && (
            <div>
              <label>
                Data Inicial:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                Data Final:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
          )}
          <div className="button-container">
            <button onClick={handleDownload}>Baixar</button>
            <button onClick={() => setIsExporting(false)}>Cancelar</button>
          </div>
        </div>
      )}

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