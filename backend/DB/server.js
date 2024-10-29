const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

// Conectar ao banco de dados uma vez
mssql.connect(config)
  .then(connectionPool => {
    pool = connectionPool;
    console.log('Conectado ao banco de dados!'); // Mensagem de conexão
  })
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// Function to export inventory to CSV
async function exportarInventarioCSV() {
  try {
    // Define the path to save the CSV file
    const path = 'C:\\BKP'; // Replace with the desired path
    const folder = `inventory-${new Date().toLocaleString('pt-BR', { month: 'long' })}`;
    const file = `${path}\\${folder}\\inventory-${new Date().toLocaleString('pt-BR', { month: 'long' })}.csv`;

    // Create folder to store CSV files
    const fs = require('fs');
    if (!fs.existsSync(`${path}\\${folder}`)) {
      fs.mkdirSync(`${path}\\${folder}`, { recursive: true });
    }

    // Save table to CSV
    const request = pool.request();
    const query = `SELECT * FROM controleInventario`;
    const result = await request.query(query);

    // Get the column names
    const columnNames = Object.keys(result.recordset[0]).join(';');

    // Map the recordset to CSV format
    const csv = [columnNames] // Add header
      .concat(result.recordset.map(item => Object.values(item).join(';')))
      .join('\n');

    // Write CSV to file
    fs.writeFileSync(file, csv);

    console.log('Inventory exported successfully!');
  } catch (error) {
    console.error('Error exporting inventory:', error);
  }
}

const checkPDFExists = async (patrimonio) => {
  const directoryPath = 'C:\\PORTAL38';
  console.log(`Verificando se o PDF existe para o patrimônio: ${patrimonio}`); // Log do patrimônio

  return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
          if (err) {
              console.error('Erro ao ler o diretório:', err);
              return reject('Erro ao verificar a existência do PDF');
          }

          const pdfExists = files.some(file => file.startsWith(`${patrimonio}`) && file.endsWith('.pdf'));
          console.log(`PDF ${patrimonio}.pdf encontrado: ${pdfExists}`); // Log da verificação
          resolve(pdfExists);
      });
  });
};

// Run the function every 1 day
setInterval(exportarInventarioCSV, 86400000); // 1 dia

// Rota para adicionar comodato
app.post('/comodato', async (req, res) => {
  try {
    const { nome, matricula, planta, centroDeCusto, setor, patrimonio, usuario } = req.body;

    console.log('Dados recebidos:', req.body);

    // Verificação dos campos obrigatórios
    if (!nome || !matricula || !centroDeCusto) {
      return res.status(400).json({ message: 'Erro: Nome, Matrícula e Centro de Custo são obrigatórios.' });
    }

    const existeRequest = new mssql.Request(pool);
    existeRequest.input('nome', mssql.VarChar, nome);
    existeRequest.input('matricula', mssql.VarChar, matricula);
    const existe = await existeRequest.query(`SELECT * FROM comodato WHERE nome = @nome AND matricula = @matricula;`);

    if (existe.recordset.length > 0) {
      return res.status(400).json({ message: 'Erro: Comodato já existe.' });
    }

    const request = new mssql.Request(pool);
    const query = `
      INSERT INTO comodato (nome, matricula, planta, centroDeCusto, setor, patrimonio, usuario, dataCriacao)
      VALUES (@nome, @matricula, @planta, @centroDeCusto, @setor, @patrimonio, @usuario, GETDATE());
    `;
    
    request.input('nome', mssql.VarChar, nome);
    request.input('matricula', mssql.VarChar, matricula);
    request.input('planta', mssql.VarChar, planta); // Adicionado o campo planta
    request.input('centroDeCusto', mssql.VarChar, centroDeCusto);
    request.input('setor', mssql.VarChar, setor || null); // Permitindo que setor seja opcional
    request.input('patrimonio', mssql.VarChar, patrimonio || null); // Permitindo que patrimônio seja opcional
    request.input('usuario', mssql.VarChar, usuario || null); // Alterado de 'user' para 'usuario'

    await request.query(query);

    // Criar PDF a partir de HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const dataCriacao = new Date().toLocaleString('pt-BR'); // Obter data e hora formatadas

    const htmlContent = `
      <html>
        <head>
          <title>Comodato</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; }
            .content { margin: 20px; }
            .field { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>COMODATO BRITÂNIA ELETRÔNICOS S.A</h1>
          <div class="content">
            <h2>CLÁUSULAS</h2>
            <p>1.1. Comodato do Direito de uso dos equipamentos mencionados no documento</p>
            <p>2.1. O prazo de duração do presente contrato é semelhante ao do contrato de trabalho ou de prestação do serviço firmado entre as partes, com início na data da assinatura do presente.</p>
            <p>3.1. Firmado o presente e na posse do equipamento, o COMODATÁRIO assume toda e qualquer responsabilidade pela conservação e guarda do equipamento que lhe é confiado.</p>
            <p>3.2. As manutenções e reparos necessários ao equipamento serão realizados pelo COMODANTE, desde que o COMODATÁRIO comunique por escrito ao COMODANTE sobre a necessidade de manutenção ou reparo.</p>
            <div class="field"><strong>Nome:</strong> ${nome}</div>
 <div class="field"><strong>Matrícula:</strong> ${matricula}</div>
            <div class="field"><strong>Planta:</strong> ${planta}</div>
            <div class="field"><strong>Centro de Custo:</strong> ${centroDeCusto}</div>
            <div class="field"><strong>Setor:</strong> ${setor || 'N/A'}</div>
            <div class="field"><strong>Patrimônio:</strong> ${patrimonio || 'N/A'}</div>
            <div class="field"><strong>Usuário:</strong> ${usuario || 'N/A'}</div>
            <div class="field"><strong>Data de Criação:</strong> ${dataCriacao}</div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });

    const filePath = path.join('C:\\PORTAL38', `${patrimonio || 'comodato'}.pdf`);
    fs.writeFileSync(filePath, pdf);
    console.log('PDF salvo em:', filePath);

    await browser.close();

    res.json({ message: 'Comodato adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar comodato:', err);
    res.status(500).json({ message: 'Erro ao adicionar comodato' });
  }
});

// Endpoint para verificar PDF específico
app.get('/check-pdfs/:patrimonio', async (req, res) => {
  const { patrimonio } = req.params;
  const pdfFilePath = path.join('C:\\PORTAL38', `${patrimonio}.pdf`);

  try {
      fs.access(pdfFilePath, fs.constants.F_OK, (err) => {
          if (err) {
              return res.status(404).json({ exists: false });
          }
          return res.json({ exists: true });
      });
  } catch (error) {
      console.error('Erro ao verificar PDF:', error);
      res.status(500).json({ message: 'Erro ao verificar PDF.' });
  }
});

// Endpoint para listar todos os PDFs
app.get('/comodato/pdf/:patrimonio', (req, res) => {
  const { patrimonio } = req.params;
  const pdfFilePath = path.join('C:\\PORTAL38', `${patrimonio}.pdf`);

  res.sendFile(pdfFilePath, (err) => {
      if (err) {
          res.status(err.status).end();
      }
  });
});


app.get('/comodato/pdf/:patrimonio', async (req, res) => {
  const { patrimonio } = req.params;
  const filePath = path.join('C:\\PORTAL38', `${patrimonio}.pdf`);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`PDF não encontrado: ${filePath}`);
      return res.status(404).send('PDF não encontrado.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${patrimonio}.pdf"`);

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erro ao enviar o PDF:', err);
        return res.status(500).send('Erro ao enviar o PDF.');
      } else {
        console.log('PDF enviado com sucesso:', filePath);
      }
    });
  } catch (error) {
    console.error('Erro ao verificar PDF:', error);
    res.status(500).send('Erro ao verificar PDF.');
  }
});


app.post('/inventario', async (req, res) => {
  try {
    const {
      patrimonio, empresa, setor, centroDeCusto, tipo, marca, modelo,
      office, compartilhada, usuarios, planta, tipoCompra, fornecedor,
      nf, dataNf, valorUnitario, dataRecebimento, chamadoFiscal,
      dataEntradaFiscal, chamadoNext, dataNext, entradaContabil,
      garantia, comodato, criadoPor
    } = req.body;

    if (!pool) {
      console.error('Pool de conexão não disponível.');
      return res.status(500).json({ message: 'Erro na conexão com o banco de dados.' });
    }

    if (!patrimonio || !empresa || !setor || !centroDeCusto || !tipo || !marca || !modelo) {
      return res.status(400).json({ message: 'Erro: Campos obrigatórios não preenchidos.' });
    }

    const comodatoBool = comodato === 'Sim' ? 'Sim' : 'Não';

    const existeRequest = new mssql.Request(pool);
    const existeQuery = `
      SELECT * FROM controleInventario WHERE patrimonio = @patrimonio;
    `;
    existeRequest.input('patrimonio', mssql.VarChar, patrimonio);
    const existe = await existeRequest.query(existeQuery);

    if (existe.recordset.length > 0) {
      return res.status(400).json({ message: 'Erro: Patrimônio já existe.' });
    }

    const request = new mssql.Request(pool);
    
    // Inicializa arrays para os campos e valores
    const fields = [
      'patrimonio', 'empresa', 'setor', 'centroDeCusto', 'tipo', 
      'marca', 'modelo', 'office', 'compartilhada', 'usuarios', 
      'planta', 'tipoCompra', 'fornecedor', 'nf', 'valorUnitario', 
      'garantia', 'comodato', 'criadoPor'
    ];
    const values = [
      '@patrimonio', '@empresa', '@setor', '@centroDeCusto', '@tipo', 
      '@marca', '@modelo', '@office', '@compartilhada', '@usuarios', 
      '@planta', '@tipoCompra', '@fornecedor', '@nf', '@valorUnitario', 
      '@garantia', '@comodato', '@criadoPor'
    ];

    // Adiciona campos de data se estiverem presentes
    if (dataNf) {
      fields.push('dataNf');
      values.push('@dataNf');
    }

    if (dataRecebimento) {
      fields.push('dataRecebimento');
      values.push('@dataRecebimento');
    }

    if (dataEntradaFiscal) {
      fields.push('dataEntradaFiscal');
      values.push('@dataEntradaFiscal');
    }

    if (dataNext) {
      fields.push('dataNext');
      values.push('@dataNext');
    }

    if (chamadoFiscal) {
      fields.push('chamadoFiscal');
      values.push('@chamadoFiscal');
    }

    if (chamadoNext) {
      fields.push('chamadoNext');
      values.push('@chamadoNext');
    }

    if (entradaContabil) {
      fields.push('entradaContabil');
      values.push('@entradaContabil');
    }

    // Constrói a consulta SQL dinamicamente
    const query = `
      INSERT INTO controleInventario (${fields.join(', ')})
      VALUES (${values.join(', ')});
    `;

    // Adiciona parâmetros à consulta
    request.input('patrimonio', mssql.VarChar, patrimonio);
    request.input('empresa', mssql.VarChar, empresa);
    request.input('setor', mssql.VarChar, setor);
    request.input('centroDeCusto', mssql.VarChar, centroDeCusto);
    request.input('tipo', mssql.VarChar, tipo);
    request.input('marca', mssql.VarChar, marca);
    request.input('modelo', mssql.VarChar, modelo);
    request.input('office', mssql.VarChar, office);
    request.input('compartilhada', mssql.VarChar, compartilhada);
    request.input('usuarios', mssql.VarChar, usuarios);
    request.input('planta', mssql.VarChar, planta);
    request.input('tipoCompra', mssql.VarChar, tipoCompra);
    request.input('fornecedor', mssql.VarChar, fornecedor);
    request.input('nf', mssql.VarChar, nf);
    request.input('valorUnitario', mssql.Decimal, valorUnitario);
    request.input('garantia', mssql.VarChar, garantia);
    request.input('comodato', mssql.VarChar, comodatoBool);
    request.input('criadoPor', mssql.VarChar, criadoPor);

    if (dataNf) {
      request.input('dataNf', mssql.Date, new Date(dataNf));
    }

    if (dataRecebimento) {
      request.input('dataRecebimento', mssql.Date, new Date(dataRecebimento));
    }

    if (dataEntradaFiscal) {
      request.input('dataEntradaFiscal', mssql.Date, new Date(dataEntradaFiscal));
    }

    if (dataNext) {
      request.input('dataNext', mssql.Date, new Date(dataNext));
    }

    if (chamadoFiscal) {
      request.input('chamadoFiscal', mssql.VarChar, chamadoFiscal);
    }

    if (chamadoNext) {
      request.input('chamadoNext', mssql.VarChar, chamadoNext);
    }

    if (entradaContabil) {
      request.input('entradaContabil', mssql.VarChar, entradaContabil);
    }

    await request.query(query);

    res.json({ message: 'Inventário adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar inventário:', err.message);
    res.status(500).json({ message: 'Erro ao adicionar inventário', error: err.message });
  }
});

// Rota para atualizar inventário
app.put('/inventario/:Patrimonio', async (req, res) => {
  const { Patrimonio } = req.params;
  const {
    empresa, setor, centroDeCusto, tipo, marca, modelo,
    office, compartilhada, usuarios, planta, tipoCompra, fornecedor,
    nf, dataNf, valorUnitario, dataRecebimento, chamadoFiscal,
    dataEntradaFiscal, chamadoNext, dataNext, entradaContabil,
    garantia, comodato, alteradoPor 
  } = req.body;

  try {
    if (!pool) throw new Error('Banco de dados não conectado.');

    const request = pool.request();

    // Declare as variáveis que você está usando
    request.input('Patrimonio', mssql.VarChar, Patrimonio);
    request.input('empresa', mssql.VarChar, empresa);
    request.input('setor', mssql.VarChar, setor);
    request.input('centroDeCusto', mssql.VarChar, centroDeCusto);
    request.input('tipo', mssql.VarChar, tipo);
    request.input('marca', mssql.VarChar, marca);
    request.input('modelo', mssql.VarChar, modelo);
    request.input('office', mssql.VarChar, office);
    request.input('compartilhada', mssql.VarChar, compartilhada);
    request.input('usuarios', mssql.VarChar, usuarios);
    request.input('planta', mssql.VarChar, planta);
    request.input('tipoCompra', mssql.VarChar, tipoCompra);
    request.input('fornecedor', mssql.VarChar, fornecedor);
    request.input('nf', mssql.VarChar, nf);
    request.input('dataNf', mssql.Date, new Date(dataNf));
    request.input('valorUnitario', mssql.Decimal, valorUnitario);
    request.input('dataRecebimento', mssql.Date, new Date(dataRecebimento));
    request.input('chamadoFiscal', mssql.VarChar, chamadoFiscal);
    request.input('dataEntradaFiscal', mssql.Date, new Date(dataEntradaFiscal));
    request.input('chamadoNext', mssql.VarChar, chamadoNext);
    request.input('dataNext', mssql.Date, new Date(dataNext));
    request.input('entradaContabil', mssql.VarChar, entradaContabil);
    request.input('garantia', mssql.VarChar, garantia);
    const comodatoBool = comodato === 'Sim' ? 'Sim' : 'Não';
    request.input('comodato', mssql.VarChar, comodatoBool);
    request.input('alteradoPor', mssql.VarChar, alteradoPor);

    const query = `
      UPDATE controleInventario SET
        empresa = @empresa, 
        setor = @setor, 
        centroDeCusto = @centroDeCusto,
        tipo = @tipo, 
        marca = @marca, 
        modelo = @modelo,
        office = @office, 
        compartilhada = @compartilhada, 
        usuarios = @usuarios,
        planta = @planta, 
        tipoCompra = @tipoCompra, 
        fornecedor = @fornecedor,
        nf = @nf, 
        dataNf = @dataNf, 
        valorUnitario = @valorUnitario,
        dataRecebimento = @dataRecebimento, 
        chamadoFiscal = @chamadoFiscal,
        dataEntradaFiscal = @dataEntradaFiscal, 
        chamadoNext = @chamadoNext,
        dataNext = @dataNext, 
        entradaContabil = @entradaContabil,
        garantia = @garantia, 
        comodato = @comodato, 
        alteradoPor = @alteradoPor
      WHERE patrimonio = @Patrimonio
    `;

    await request.query(query);
    res.json({ message: 'Inventário atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar inventário:', error);
    res.status(500).json({ error: 'Erro ao atualizar inventário' });
  }
});


// Rota para verificar se o registro existe
app.get('/inventario/existe/:patrimonio', async (req, res) => {
  const { patrimonio } = req.params;
  try {
    if (!pool) throw new Error('Banco de dados não conectado.');

    const request = pool.request();
    const query = `
      SELECT *
      FROM controleInventario
      WHERE patrimonio = @patrimonio
    `;
    request.input('patrimonio', mssql.VarChar, patrimonio);
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.json({ existe: true, registro: result.recordset[0] });
    } else {
      res.json({ existe: false });
    }
  } catch (error) {
    console.error('Erro ao verificar se o registro existe:', error);
    res.status(500).json({ error: 'Erro ao verificar se o registro existe.' });
  }
});

//Rota para hora do banco
app.get('/getCurrentTimestamp', (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({ timestamp });
});

// Rota para importar inventário em massa
app.post('/inventario/importar', async (req, res) => {
  try {
    const dados = req.body;

    for (const item of dados) {
      const {
        patrimonio, empresa, setor, centroDeCusto, tipo, marca, modelo,
        office, compartilhada, usuarios, planta, tipoCompra, fornecedor,
        nf, dataNf, valorUnitario, dataRecebimento, chamadoFiscal,
        dataEntradaFiscal, chamadoNext, dataNext, entradaContabil,
        garantia, comodato, criadoPor
      } = item;

      const comodatoBool = comodato === 'Sim' ? 'Sim' : 'Não';

      const dataCriacao = new Date().toISOString();

      const existeRequest = new mssql.Request(pool);
      const existeQuery = `
        SELECT * FROM controleInventario WHERE patrimonio = @patrimonio;
      `;

      existeRequest.input('patrimonio', mssql.VarChar, patrimonio);

      const existe = await existeRequest.query(existeQuery);

      if (existe.recordset.length > 0) {
        // Atualizar o registro existente
        const updateRequest = new mssql.Request(pool);
        const updateQuery = `
          UPDATE controleInventario SET
            empresa = @empresa,
            setor = @setor,
            centroDeCusto = @centroDeCusto,
            tipo = @tipo,
            marca = @marca,
            modelo = @modelo,
            office = @office,
            compartilhada = @compartilhada,
            usuarios = @usuarios,
            planta = @planta,
            tipoCompra = @tipoCompra,
            fornecedor = @fornecedor,
            nf = @nf,
            valorUnitario = @valorUnitario,
            garantia = @garantia,
            comodato = @comodato,
            criadoPor = @criadoPor,
            dataCriacao = @dataCriacao
          WHERE patrimonio = @patrimonio;
        `;

        updateRequest.input('empresa', mssql.VarChar, empresa);
        updateRequest.input('setor', mssql.VarChar, setor);
        updateRequest.input('centroDeCusto', mssql.VarChar, centroDeCusto);
        updateRequest.input('tipo', mssql.VarChar, tipo);
        updateRequest.input('marca', mssql.VarChar, marca);
        updateRequest.input('modelo', mssql.VarChar, modelo);
        updateRequest.input('office', mssql.VarChar, office);
        updateRequest.input('compartilhada', mssql.VarChar, compartilhada);
        updateRequest.input('usuarios', mssql.VarChar, usuarios);
        updateRequest.input('planta', mssql.VarChar, planta);
        updateRequest.input('tipoCompra', mssql.VarChar, tipoCompra);
        updateRequest.input('fornecedor', mssql.VarChar, fornecedor);
        updateRequest.input('nf', mssql.VarChar, nf);
        updateRequest.input('valorUnitario', mssql.Decimal, valorUnitario);
        updateRequest.input('garantia', mssql.VarChar, garantia);
        updateRequest.input('comodato', mssql.VarChar, comodatoBool);
        updateRequest.input('criadoPor', mssql.VarChar, criadoPor);
        updateRequest.input('dataCriacao', mssql.DateTime, dataCriacao);
        updateRequest.input('patrimonio', mssql.VarChar, patrimonio);

        if (dataNf) {
          const dataNfDate = new Date(dataNf);
          if (!isNaN(dataNfDate.getTime())) {
            updateRequest.input('dataNf', mssql.Date, dataNfDate);
          }
        }

        if (dataRecebimento) {
          const dataRecebimentoDate = new Date(dataRecebimento);
          if (!isNaN(dataRecebimentoDate.getTime())) {
            updateRequest.input('dataRecebimento', mssql.Date, dataRecebimentoDate);
          }
        }

        if (dataEntradaFiscal) {
          const dataEntradaFiscalDate = new Date(dataEntradaFiscal);
          if (!isNaN(dataEntradaFiscalDate.getTime())) {
            updateRequest.input('dataEntradaFiscal', mssql.Date, dataEntradaFiscalDate);
          }
        }

        if (dataNext) {
          const dataNextDate = new Date(dataNext);
          if (!isNaN(dataNextDate.getTime())) {
            updateRequest.input('dataNext', mssql.Date, dataNextDate);
          }
        }

        if (chamadoFiscal) {
          updateRequest.input('chamadoFiscal', mssql.VarChar, chamadoFiscal);
        }

        if (chamadoNext) {
          updateRequest.input('chamadoNext', mssql.VarChar, chamadoNext);
        }

        if (entradaContabil) {
          updateRequest.input('entradaContabil', mssql.VarChar, entradaContabil);
        }

        await updateRequest.query(updateQuery);
      } else {
        // Inserir novo registro
        const insertRequest = new mssql.Request(pool);
        const insertQuery = `
          INSERT INTO controleInventario (
            patrimonio, empresa, setor, centroDeCusto, tipo, marca, modelo,
            office, compartilhada, usuarios, planta, tipoCompra, fornecedor,
            nf, dataNf, valorUnitario, dataRecebimento, chamadoFiscal,
            dataEntradaFiscal, chamadoNext, dataNext, entradaContabil,
            garantia, comodato, criadoPor, dataCriacao
          ) VALUES (
            @patrimonio, @empresa, @setor, @centroDeCusto, @tipo, @marca,
            @modelo, @office, @compartilhada, @usuarios, @planta, @tipoCompra,
            @fornecedor, @nf, @dataNf, @valorUnitario, @dataRecebimento,
            @chamadoFiscal, @dataEntradaFiscal, @chamadoNext, @dataNext,
            @entradaContabil, @garantia, @comodato, @criadoPor, @dataCriacao
          );
        `;

        insertRequest.input('patrimonio', mssql.VarChar, patrimonio);
        insertRequest.input('empresa', mssql.VarChar, empresa);
        insertRequest.input('setor', mssql.VarChar, setor);
        insertRequest.input('centroDeCusto', mssql.VarChar, centroDeCusto);
        insertRequest.input('tipo', mssql.VarChar, tipo);
        insertRequest.input('marca', mssql.VarChar, marca);
        insertRequest.input('modelo', mssql.VarChar, modelo);
        insertRequest.input('office', mssql.VarChar, office);
        insertRequest.input('compartilhada', mssql.VarChar, compartilhada);
        insertRequest.input('usuarios', mssql.VarChar, usuarios);
        insertRequest.input('planta', mssql.VarChar, planta);
        insertRequest.input('tipoCompra', mssql.VarChar, tipoCompra);
        insertRequest.input('fornecedor', mssql.VarChar, fornecedor);
        insertRequest.input('nf', mssql.VarChar, nf);
        insertRequest.input('valorUnitario', mssql.Decimal, valorUnitario);
        insertRequest.input('garantia', mssql.VarChar, garantia);
        insertRequest.input('comodato', mssql.VarChar, comodatoBool);
        insertRequest.input('criadoPor', mssql.VarChar, criadoPor);
        insertRequest.input('dataCriacao', mssql.DateTime, dataCriacao);

        if (dataNf) {
          const dataNfDate = new Date(dataNf);
          if (!isNaN(dataNfDate.getTime())) {
            insertRequest.input('dataNf', mssql.Date, dataNfDate);
          }
        }

        if (dataRecebimento) {
          const dataRecebimentoDate = new Date(dataRecebimento);
          if (!isNaN(dataRecebimentoDate.getTime())) {
            insertRequest.input('dataRecebimento', mssql.Date, dataRecebimentoDate);
          }
        }

        if (dataEntradaFiscal) {
          const dataEntradaFiscalDate = new Date(dataEntradaFiscal);
          if (!isNaN(dataEntradaFiscalDate.getTime())) {
            insertRequest.input('dataEntradaFiscal', mssql.Date, dataEntradaFiscalDate);
          }
        }

        if (dataNext) {
          const dataNextDate = new Date(dataNext);
          if (!isNaN(dataNextDate.getTime())) {
            insertRequest.input('dataNext', mssql.Date, dataNextDate);
          }
        }

        if (chamadoFiscal) {
          insertRequest.input('chamadoFiscal', mssql.VarChar, chamadoFiscal);
        }

        if (chamadoNext) {
          insertRequest.input('chamadoNext', mssql.VarChar, chamadoNext);
        }

        if (entradaContabil) {
          insertRequest.input('entradaContabil', mssql.VarChar, entradaContabil);
        }

        await insertRequest.query(insertQuery);
      }
    }

    res.json({ message: 'Dados importados com sucesso!' });
  } catch (err) {
    console.error('Erro ao importar os dados:', err);
    res.status(500).json({ message: 'Erro ao importar os dados' });
  }
});

// Rota para obter todos os inventários
app.get('/inventario', async (req, res) => {
  try {
    if (!pool) throw new Error('Banco de dados não conectado.');

    const request = pool.request();
    const query = `
      SELECT *, criadoPor
      FROM controleInventario
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao obter os inventários:', error);
    res.status(500).json({ error: 'Erro ao obter os inventários.' });
  }
});

// Rota para exportar inventário com base na data da criação
app.get('/inventario/exportar', async (req, res) => {
  try {
    const { dataCriacao } = req.query;
    const request = pool.request();
    const query = `
      SELECT *, criadoPor
      FROM controleInventario
      WHERE dataCriacao >= @dataCriacao
    `;
    request.input('dataCriacao', mssql.Date, dataCriacao);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao exportar inventário:', error);
    res.status(500).json({ error: 'Erro ao exportar inventário' });
  }
});

// Endpoint para contar equipamentos e comodatos
app.get('/dashboard/contagem', async (req, res) => {
  try {
    if (!pool) throw new Error('Banco de dados não conectado.');

    const planta = req.query.planta;
    const request = pool.request();

    // Definindo o parâmetro 'planta' uma única vez
    request.input('planta', mssql.VarChar, planta);

    // Consulta para contar equipamentos por planta
    const inventarioQuery = `
    SELECT 
      SUM(CASE WHEN tipo = 'servidor' THEN 1 ELSE 0 END) AS total_servidor,
      SUM(CASE WHEN tipo = 'Desktop' THEN 1 ELSE 0 END) AS total_desktops,
      SUM(CASE WHEN tipo = 'Notebook' THEN 1 ELSE 0 END) AS total_notebooks
    FROM controleInventario
    WHERE planta = @planta;
    `;
    
    // Executando a consulta para o inventário
    const inventarioResult = await request.query(inventarioQuery);
    
    // Consulta para contar comodatos por planta
    const comodatoQuery = `
    SELECT COUNT(*) AS total_comodatos 
    FROM comodato
    WHERE planta = @planta;  -- Supondo que a tabela comodato tenha uma coluna planta
    `;
    
    // Executando a consulta para comodatos
    const comodatoResult = await request.query(comodatoQuery);

    const response = {
      total_servidor: inventarioResult.recordset[0].total_servidor || 0,
      total_desktops: inventarioResult.recordset[0].total_desktops || 0,
      total_notebooks: inventarioResult.recordset[0].total_notebooks || 0,
      total_comodatos: comodatoResult.recordset[0].total_comodatos || 0,
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao obter contagem:', error);
    res.status(500).json({ error: 'Erro ao obter contagem.' });
  }
});

// Endpoint para obter as últimas alterações na tabela controleInventario
app.get('/dashboard/recent-changes', async (req, res) => {
  try {
    const planta = req.query.planta;

    const query = `
      SELECT TOP 10 
        patrimonio,
        modelo,
        marca,
        dataCriacao AS data, 
        criadoPor, 
        alteradoPor 
      FROM controleInventario 
      WHERE planta = @planta
      ORDER BY dataCriacao DESC;
    `;
    
    const request = pool.request();
    request.input('planta', mssql.VarChar, planta); // Aqui deve ser mssql e não sql

    const results = await request.query(query);

    res.json(results.recordset);
  } catch (error) {
    console.error('Erro ao buscar alterações:', error);
    res.status(500).json({ error: 'Erro ao buscar alterações' });
  }
});

// Endpoint para buscar plantas disponíveis
app.get('/dashboard/plantas', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT planta FROM controleInventario';
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar plantas:', error);
    res.status(500).json({ error: 'Erro ao buscar plantas' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});