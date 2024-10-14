const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Armazena as informações recebidas
let systemInfo = {};

// Endpoint para receber as informações do serviceWorker
app.post('/api/system-info', (req, res) => {
  const { hostname, accountName } = req.body;

  // Armazena as informações recebidas
  systemInfo = { hostname, accountName };

  console.log('Received system info:', systemInfo);
  res.status(200).send('Info received');
});

// Endpoint para retornar as informações
app.get('/api/system-info', (req, res) => {
  res.json(systemInfo);
});

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
});
