const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Papa = require('papaparse');
const cron = require('node-cron');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Endpoint para obter as informações do sistema
app.get('/api/system-info', (req, res) => {
  fs.readFile(path.join(__dirname, 'system_info.log'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read log file' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse log file' });
    }
  });
});

// Função para realizar o backup
const realizarBackup = () => {
  const dados = [
    { id: 1, produto: 'Produto A', quantidade: 10 },
    { id: 2, produto: 'Produto B', quantidade: 5 },
    // Adicione seus dados reais aqui
  ];

  const csv = Papa.unparse(dados);
  const data = new Date();
  const opcoes = { month: 'long', year: 'numeric' };
  const nomeMes = data.toLocaleDateString('pt-BR', opcoes).replace(' de ', '_').replace(' ', '_');
  const nomeArquivo = path.join('C:\\Backup', `estoque_backup_${nomeMes}.csv`);

  fs.writeFileSync(nomeArquivo, csv);
  console.log(`Backup salvo como: ${nomeArquivo}`);
};

// Agendar o backup a cada 30 dias
cron.schedule('0 0 1 * *', realizarBackup);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`API Server running at http://mao-s038:${port}`);
});

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const authService = require('./service/authService');

app.use(bodyParser.json());

// Rota de autenticação
app.post('/authenticate', authService.authenticate);

// Inicie o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
