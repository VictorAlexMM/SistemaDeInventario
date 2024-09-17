const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Para permitir que o frontend React acesse a API
const app = express();
const port = 3001; // Ou qualquer porta disponível

app.use(cors()); // Permite CORS para todos os domínios
app.use(express.json());

// Endpoint para obter as informações do sistema
app.get('/api/system-info', (req, res) => {
  fs.readFile(path.join(__dirname, 'system_info.log'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read log file' });
    }
    res.json({ log: data });
  });
});

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
});
