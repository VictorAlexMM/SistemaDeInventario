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
    const [estoque, setEstoque] = useState([]);;
    const [isAdding, setIsAdding] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [downloadOption, setDownloadOption] = useState('completo');
    const [newEstoque, setNewEstoque] = useState({
      Patrimonio: '',
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
      alteradoPor:'',
      dataCriacao: '',
      dataModificacao: '',
      dataNextDesmobilizado:'',
      Observacao:'',
      ChamadoSolicitacao:''
    });
    const [csvFile, setCsvFile] = useState(null);
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'patrimonio', direction: 'asc' });
    const [sortCriteria, setSortCriteria] = useState('dataCriacao');
    const [sortOrder, setSortOrder] = useState('asc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [username, setUsername] = useState('');
    const [pdfUrl, setPdfUrl] = useState(''); 
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [plants, setPlants] = useState([]);
    const [selectedPlanta, setSelectedPlanta] = useState('');
    
    useEffect(() => {
      const fetchPlants = async () => {
        try {
          const response = await axios.get('http://mao-s038:3003/dashboard/plantas');
          setPlants(response.data);
        } catch (error) {
          console.error('Erro ao buscar plantas:', error);
        }
      };
  
      fetchPlants();
    }, []);

    useEffect(() => {
      const loggedUser = localStorage.getItem('loggedUser ');
      if (loggedUser ) {
        try {
          const user = JSON.parse(loggedUser ); // Assume que loggedUser é um objeto JSON
          setUsername(user.username); // Supondo que loggedUser tem uma propriedade 'username'
          setNewEstoque((prevState) => ({ ...prevState, criadoPor: user.username }));
        } catch (error) {
          console.error('Erro ao analisar loggedUser :', error);
        }
      }
    }, []);
    const handleExport = async () => {
      setIsExporting(true);
      try {
        const response = await axios.get('http://mao-s038:3003/inventario');
        const data = response.data;
        const filteredData = data.filter(item => {
          const createdAt = moment(item.dataCriacao);
          return createdAt.isBetween(startDate, endDate, 'day', '[]');
        });
        const csvData = filteredData.map(item => {
          return {
            Patrimonio: item.Patrimonio,
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
            AlteradoPor:item.alteradoPor,
            DataCriacao: moment(item.dataCriacao).format('DD/MM/YYYY'),
            DataModificacao: moment(item.dataModificacao).format('DD/MM/YYYY'),
            dataNextDesmobilizado:moment(item.dataNextDesmobilizado).formart('DD/MM/YYYY'),
            Observacao:item.Observacao,
            ChamadoSolicitacao:item.ChamadoSolicitacao
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
      item.Patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      if (!selectedPlanta) {
        alert('Por favor, selecione uma planta antes de baixar.');
        return;
      }
    
      try {
        if (downloadOption === 'completo') {
          await downloadFilledCSV(selectedPlanta); // Passa a planta selecionada
        } else if (downloadOption === 'periodo') {
          if (!startDate || !endDate) {
            alert('Por favor, preencha as datas inicial e final.');
            return;
          }
    
          // Verifica se as datas estão corretas
          if (moment(startDate).isAfter(moment(endDate))) {
            alert('A data inicial não pode ser posterior à data final.');
            return;
          }
    
          await downloadByPeriod(selectedPlanta, startDate, endDate); // Passa a planta e as datas
        }
      } catch (error) {
        console.error('Erro ao realizar o download:', error);
        alert('Ocorreu um erro ao tentar realizar o download. Por favor, tente novamente.');
      } finally {
        setIsExporting(false);
      }
    };
    
    const downloadByPeriod = async (planta, startDate, endDate) => {
      try {
        const response = await axios.get('http://mao-s038:3003/inventario/exportar', {
          params: {
            planta: planta,
            startDate: startDate,
            endDate: endDate
          }
        });
    
        const data = response.data;
        console.log('Dados retornados da API:', data);
    
        // Filtra os dados baseado nas datas de criação e na planta
        const filteredData = data.filter(item => {
          const createdAt = moment(item.dataCriacao); // A data de criação do item
          const isInDateRange = createdAt.isBetween(moment(startDate), moment(endDate), 'day', '[]');
          const isInSelectedPlanta = item.planta === planta; // Verifica se a planta do item é a selecionada
    
          return isInDateRange && isInSelectedPlanta; // Retorna true se estiver dentro do intervalo e na planta selecionada
        });
    
        if (filteredData.length === 0) {
          alert('Nenhum dado encontrado para o período e planta selecionados.');
          return;
        }
    
        const csvData = filteredData.map(item => ({
          Patrimonio: item.Patrimonio,
          Empresa: item.empresa,
          Setor: item.setor,
          CentroDeCusto: item.centroDeCusto,
          Tipo: item.tipo,
          Marca: item.marca,
          Modelo: item.modelo,
          Office: item.office,
          Compartilhada: item.compartilhada ? 'Sim' : 'Não',
          Usuarios: item.usuarios,
          Planta: item.planta,
          TipoCompra: item.tipoCompra,
          Fornecedor: item.fornecedor,
          NF: item.nf,
          DataNF: moment(item.dataNf).format('YYYY/MM/DD'), 
          ValorUnitario: item.valorUnitario,
          DataRecebimento: moment(item.dataRecebimento).format('YYYY/MM/DD'), 
          ChamadoFiscal: item.chamadoFiscal,
          DataEntradaFiscal: moment(item.dataEntradaFiscal).format('YYYY/MM/DD'), 
          ChamadoNext: item.chamadoNext,
          DataNext: moment(item.dataNext).format('YYYY/MM/DD'), 
          EntradaContabil: item.entradaContabil,
          Garantia: item.garantia,
          Comodato: item.comodato,
          CriadoPor: item.criadoPor,
          AlteradoPor: item.alteradoPor,
          DataCriacao: moment(item.dataCriacao).format('YYYY/MM/DD'), 
          DataModificacao: moment(item.dataModificacao).format('YYYY/MM/DD'),
          dataNextDesmobilizado:moment(item.dataNextDesmobilizado).format('DD/MM/YYYY'),
          Observacao:item.Observacao,
          ChamadoSolicitacao:item.ChamadoSolicitacao
        }));
    
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'estoque.csv';
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao baixar os dados por período:', error);
        alert('Ocorreu um erro ao tentar baixar os dados por período. Por favor, tente novamente.');
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
      const setor = centroDeCusto[newEstoque.centroDeCusto] || '';
      setNewEstoque(prevState => ({ ...prevState, setor }));
    }, [newEstoque.centroDeCusto]);

  const getEstoque = async () => {
      try {
        const response = await axios.get('http://mao-s038:3003/inventario');
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
      
      if (name !== 'criadoPor') {
        // Verifica se o campo é 'compartilhada' ou 'comodato'
        if (name === 'compartilhada' || name === 'comodato') {
          // Atualiza o estado baseado no valor selecionado
          setNewEstoque(prev => ({ ...prev, [name]: value }));
        } else {
          // Para outros campos, verifica se é um checkbox
          setNewEstoque(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Verificar se o patrimônio já existe no servidor
        const existeResponse = await axios.get(`http://mao-s038:3003/inventario/existe/${newEstoque.Patrimonio}`);
        if (existeResponse.data.existe && editingIndex === null) {
          alert('Erro: Patrimônio já existe.');
          return;
        }
    
        const compartilhada = newEstoque.compartilhada === 'Sim' ? 'Sim' : 'Não';
        const comodato = newEstoque.comodato === 'Sim' ? 'Sim' : 'Não';
        const method = editingIndex !== null ? 'put' : 'post';
        const url = editingIndex !== null ? `http://mao-s038:3003/inventario/${newEstoque.Patrimonio}` : 'http://mao-s038:3003/inventario';
    
        const data = {
          ...newEstoque,
          compartilhada: compartilhada,
          criadoPor: username, 
          comodato: comodato,
          alteradoPor: username,
        };
    
        // Formatar datas como opcional
        if (data.dataNf) data.dataNf = moment(data.dataNf).format('YYYY-MM-DD');
        if (data.dataRecebimento) data.dataRecebimento = moment(data.dataRecebimento).format('YYYY-MM-DD');
        if (data.dataEntradaFiscal) data.dataEntradaFiscal = moment(data.dataEntradaFiscal).format('YYYY-MM-DD');
        if (data.dataNext) data.dataNext = moment(data.dataNext).format('YYYY-MM-DD');
        if (data.dataNextDesmobilizado) data.dataNextDesmobilizado = moment(data.dataNextDesmobilizado).format('YYYY-MM-DD');
    
        if (data.valorUnitario === '') {
          data.valorUnitario = null;
        }
    
        const response = await axios[method](url, data);
        alert(response.data.message);
        setNewEstoque({});
        setIsAdding(false);
        getEstoque();
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Erro ao enviar os dados.';
        alert(errorMessage);
      }
    };

    const handleEdit = (index) => {
      setNewEstoque(estoque[index]);
      setEditingIndex(index);
      setIsAdding(true);
      setNewEstoque(prevState => ({ ...prevState, alteradoPor: username }));
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
      
          const formattedData = [];
    
          for (const item of csvData) {
            const setor = centroDeCusto[item['Centro de Custo']] || '';
            
            // Convert dates to ISO format
            const dataNfIso = item['Data NF'] ? moment(item['Data NF'], 'DD/MM/YYYY', true).toISOString() : '';
            const dataRecebimentoIso = item['Data Recebimento'] ? moment(item['Data Recebimento'], 'DD/MM/YYYY', true).toISOString() : '';
            const dataEntradaFiscalIso = item['Data Entrada Fiscal'] ? moment(item['Data Entrada Fiscal'], 'DD/MM/YYYY', true).toISOString() : '';
            const dataNextIso = item['Data Next'] ? moment(item['Data Next'], 'DD/MM/YYYY', true).toISOString() : '';
            const dataNextDesmobilizadoIso = item['Data Next Desmobilizado'] ? moment(item['Data Next Desmobilizado'], 'DD/MM/YYYY', true).toISOString() : '';
              
            if (item.Patrimônio && item.Empresa && setor && item['Centro de Custo']) {
              formattedData.push({
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
                criadoPor: '',
                alteradoPor: getCookie('username') || '',
                dataModificacao: '',
                dataNextDesmobilizado:dataNextDesmobilizadoIso,
                observacao:item.Observacao ||'',
                ChamadoSolicitacao:item.ChamadoSolicitacao ||'',
              });
            } else {
              alert('Erro: Dados inválidos. Por favor, verifique os dados e tente novamente.');
              return;
            }
          }
    
          try {
            const response = await axios.post('http://mao-s038:3003/inventario/importar', formattedData);
            alert('Dados importados com sucesso!');
            getEstoque();
          } catch (error) {
            if (error.response) {
              alert(`Erro ${error.response.status}: ${error.response.data.message}`);
            } else {
              alert('Erro ao importar os dados. Por favor, tente novamente.');
            }
          }
        },
        error: (error) => {
          alert('Erro ao importar o arquivo CSV.');
        }
      });
    };
    
    const downloadExampleCSV = () => {
      const csvHeader = [
        'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
        'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
        'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
        'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia','Comodato',
        'Data Next Desmobilizado','Observação','ChamadoSolicitacao'
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

    const checkPDFExists = async (patrimonio) => {
      try {
          const response = await fetch(`http://mao-s038:3003/check-pdfs/${patrimonio}`);
          const text = await response.text(); // Lê a resposta como texto
          const data = JSON.parse(text); // Tente analisar como JSON
          return data.exists; 
      } catch (error) {
          console.error('Erro ao verificar PDF:', error);
          alert('Erro ao verificar PDF. Tente novamente mais tarde.');
          return false;
      }
  };
  
  const viewPDF = async (patrimonio) => {
    
    // Verifica se o PDF existe
    const pdfExists = await checkPDFExists(patrimonio);
    
    if (!pdfExists) {
        alert('PDF não encontrado.');
        return;
    }

    try {
        const response = await fetch(`http://mao-s038:3003/comodato/pdf/${patrimonio}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url); // Define a URL do PDF
            setIsPdfModalOpen(true); // Abre o modal
        } else {
            throw new Error('Erro ao carregar o PDF.');
        }
    } catch (error) {
        console.error('Erro ao visualizar PDF:', error);
        alert('Erro ao visualizar PDF. Verifique se o arquivo existe.');
    }
};

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl(''); // Limpa a URL do PDF
};
  const downloadFilledCSV = () => {
    if (estoque.length === 0) {
      alert('Não há dados preenchidos para exportar.');
      return;
    }

    // Filtra o estoque pela planta selecionada
    const filteredEstoque = estoque.filter(item => item.planta === selectedPlanta);
    
    if (filteredEstoque.length === 0) {
      alert('Não há dados preenchidos para a planta selecionada.');
      return;
    }

    const csvHeader = [
      'Patrimônio', 'Empresa', 'Setor', 'Centro de Custo', 'Tipo', 'Marca', 'Modelo',
      'Office', 'Compartilhada', 'Usuários', 'Planta', 'Tipo Compra', 'Fornecedor',
      'NF', 'Data NF', 'Valor Unitário', 'Data Recebimento', 'Chamado Fiscal',
      'Data Entrada Fiscal', 'Chamado Next', 'Data Next', 'Entrada Contábil', 'Garantia', 'Comodato', 'Data Criação', 'Data Modificação',
      'Data Next Desmobilizado','Observação','ChamadoSolicitacao'
    ].map(header => `"${header}"`).join(',') + '\n';

    const csvRows = filteredEstoque.map(item =>
      [
        item.Patrimonio, item.empresa, item.setor, item.centroDeCusto, item.tipo,
        item.marca, item.modelo, item.office, item.compartilhada ? 'Sim' : 'Não',
        item.usuarios, item.planta, item.tipoCompra, item.fornecedor, item.nf,
        moment(item.dataNf).format('YYYY-MM-DD'), item.valorUnitario,
        moment(item.dataRecebimento).format('YYYY-MM-DD'), item.chamadoFiscal,
        moment(item.dataEntradaFiscal).format('YYYY-MM-DD'), item.chamadoNext,
        moment(item.dataNext).format('YYYY-MM-DD'), item.entradaContabil,
        item.garantia, item.comodato ? 'Sim' : 'Não',
        moment(item.dataCriacao).format('YYYY-MM-DD'), moment(item.dataModificacao).format('YYYY-MM-DD'),
        moment(item.dataNextDesmobilizado).format('YYYY-MM-DD'),item.Observacao
      ].map(value => `"${(value !== undefined && value !== null ? value : '').toString().replace(/"/g, '""')}"`).join(',')
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
        criadoPor: username,
        alteradoPor:'',
        dataCriacao: '',
        dataModificacao: '',
        dataNextDesmobilizado:'',
        observacao:'',
        ChamadoSolicitacao:''
      });
      setIsAdding(false);
    };

    const now = new Date().toISOString();

    const formatDate = (date) => {
      return moment(date).format('DD-MM-YYYY');
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
                    <td>{item.Patrimonio}</td>
                    <td>{item.empresa}</td>
                    <td>{item.setor}</td>
                    <td>{item.centroDeCusto}</td>
                    <td>{item.tipo}</td>
                    <td>{item.marca}</td>
                    <td>{item.modelo}</td>
                    <td>{item.office}</td>
                    <td>{item.compartilhada === 'Sim' ? 'Sim' : 'Não'}</td>
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
                            <div className="collapsible-content" style={{ backgroundColor: '#515151', color: '#fff', padding: '5px', borderRadius: '5px' }}>
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
                                            <td><strong>Chamado:</strong></td>
                                            <td>{item.ChamadoSolicitacao}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Data Next:</strong></td>
                                            <td>{formatDate(item.dataNext)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Data Next Desmobilização:</strong></td>
                                            <td>{formatDate(item.dataNextDesmobilizado)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Entrada Contábil:</strong></td>
                                            <td>{item.entradaContabil}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Garantia:</strong></td>
                                            <td>{item.garantia}</td>
                                        </tr>
                                        <tr style={{ color: '#fff' }}>
                                        <td><strong>Comodato:</strong></td>
                                        <td colSpan="2">
                                            <button 
                                                onClick={() => viewPDF(item.Patrimonio)} 
                                                disabled={loadingPDF} 
                                                style={{ 
                                                    color: '#000', // Texto preto para o botão
                                                    border: '1px solid #ccc', // Borda sutil
                                                    padding: '5px 10px', 
                                                    borderRadius: '3px', 
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {loadingPDF ? 'Carregando...' : `Visualizar PDF (${item.Patrimonio}.pdf)`}
                                            </button>
                                        </td>
                                    </tr>
                                        <tr>
                                            <td><strong>Criado Por:</strong></td>
                                            <td>{item.criadoPor[0]}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Alterado Por:</strong></td>
                                            <td>{item.alteradoPor}</td>
                                        </tr>
                                        <tr>
                                          <td><strong>Observação:</strong></td>
                                          <td>{item.Observacao}</td>
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
        {isPdfModalOpen && (
          <div className="pdf-modal" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
              <div
                  className="pdf-modal-content"
                  style={{
                      marginTop: '20px',
                      border: '1px solid', // Ajuste a cor e a espessura aqui
                      borderRadius: '8px', // Ajuste o raio das bordas
                      padding: '20px 10px', // Reduz o padding lateral
                      maxHeight: '80vh',
                      overflowY: 'auto',
                      background: 'transparent' // Remove o fundo
                  }}
              >
                  <span className="close" onClick={closePdfModal}>&times;</span>
                  <iframe src={pdfUrl} style={{ width: '100%', height: '600px', border: 'none' }}></iframe>
              </div>
          </div>
      )}
        {isAdding && (
          <div className="add-edit-form-modal">
            <form onSubmit={handleSubmit}>
              <label>
                Patrimônio*:
                <input
                  type="text"
                  name="patrimonio"
                  value={newEstoque.Patrimonio}
                  onChange={handleChange}
                  required
                  disabled={editingIndex !== null}
                />
              </label>
              <label>
                Empresa*:
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
                Centro de Custo*:
                <input
                  type="text"
                  name="centroDeCusto"
                  value={newEstoque.centroDeCusto}
                  onChange={handleChange}
                />
              </label>
              <label>
                Tipo*:
                <input
                  type="text"
                  name="tipo"
                  value={newEstoque.tipo}
                  onChange={handleChange}
                />
              </label>
              <label>
                Marca*:
                <input
                  type="text"
                  name="marca"
                  value={newEstoque.marca}
                  onChange={handleChange}
                />
              </label>
              <label>
                Modelo*:
                <input
                  type="text"
                  name="modelo"
                  value={newEstoque.modelo}
                  onChange={handleChange}
                />
              </label>
              <label>
                Office*:
                <input
                  type="text"
                  name="office"
                  value={newEstoque.office}
                  onChange={handleChange}
                />
              </label>
              <label>
                Compartilhada*:
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
                Usuários*:
                <input
                  type="text"
                  name="usuarios"
                  value={newEstoque.usuarios}
                  onChange={handleChange}
                />
              </label>
              <label>
                Planta:
                <select
                  name="planta"
                  value={newEstoque.planta}
                  onChange={(e) => setNewEstoque({ ...newEstoque, planta: e.target.value })}
                >
                  <option value="">Selecione uma planta</option> {/* Default option */}
                  <option value="Linhares">Linhares</option>
                  <option value="Curitiba Matriz">Curitiba Matriz</option>
                  <option value="Curitiba Marechal">Curitiba Marechal</option> {/* Fixed closing tag */}
                  <option value="Joinville Fabrica A1">Joinville Fabrica A1</option>
                  <option value="Joinville Fabrica A2">Joinville Fabrica A2</option>
                  <option value="Joinville Fabrica A3">Joinville Fabrica A3</option>
                  <option value="Joinville CD B1">Joinville CD B1</option>
                  <option value="Joinville CD B2">Joinville CD B2</option>
                  <option value="Joinville AG C1">Joinville AG C1</option>
                  <option value="MANAUS A1">MANAUS A1</option>
                  <option value="MANAUS A2">MANAUS A2</option>
                  <option value="MANAUS A3">MANAUS A3</option>
                  <option value="MANAUS B1">MANAUS B1</option>
                  <option value="MANAUS B2">MANAUS B2</option>
                  <option value="MANAUS B3">MANAUS B3</option>
                  <option value="MANAUS IMC">MANAUS IMC</option>
                  <option value="MANAUS IAC">MANAUS IAC</option>
                </select>
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
                Chamado:
                <input
                  type="text"
                  name="ChamadoSolicitacao"
                  value={newEstoque.ChamadoSolicitacao}
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
                Data Next Desmobilizado:
                <input
                  type="date"
                  name="dataNextDesmobilizado"
                  value={moment(newEstoque.dataNextDesmobilizado).format('YYYY-MM-DD')}
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
              <label className='Observacao'>
                Observação:
                <textarea
                  name="Observação"
                  value={newEstoque.Observacao}
                  onChange={handleChange}
                  rows="2" // Ajuste conforme necessário
                  cols="500" // Ajuste conforme necessário
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
                Selecionar Opção de Download:
                <select onChange={(e) => setDownloadOption(e.target.value)} value={downloadOption}>
                  <option value="completo">Completo</option>
                  <option value="periodo">Por Período</option>
                </select>
              </label>
              <label>
                Selecionar Planta:
                <select onChange={(e) => setSelectedPlanta(e.target.value)} value={selectedPlanta}>
                  <option value="">Selecione uma planta</option>
                  {plants.map((planta, index) => (
                    <option key={index} value={planta.planta}>{planta.planta}</option>
                  ))}
                </select>
              </label>
              {downloadOption === 'periodo' && (
                <div>
                  <label>
                    Data Inicial:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </label>

                  <label>
                    Data Final:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </label>
                </div>
              )}
              <div className="button-container">
                <button onClick={handleDownload} disabled={!selectedPlanta || (downloadOption === 'periodo' && (!startDate || !endDate))}>
                  Baixar
                </button>
                <button onClick={() => setIsExporting(false)}>Cancelar</button>
              </div>
            </div>
          )}
        {isImporting && (
          <div className="import-csv-modal">
            <form onSubmit={handleImport}>
              <h5>
                Selecione o arquivo CSV:
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
              </h5>
              <button type="submit" className="btn-importar">Importar</button>
              <button type="button" className="btn-cancelar" onClick={() => setIsImporting(false)}>Cancelar</button>
              <button type="button" className="btn-exemplo" onClick={downloadExampleCSV}>
                Baixar Exemplo CSV
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  export default Estoque;