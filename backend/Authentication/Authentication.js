const express = require('express');
const mssql = require('mssql');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();
const port = process.env.PORT || 5000;

// Middleware para analisar JSON
app.use(express.json());
app.use(cors()); // Habilita CORS para permitir requisições de diferentes origens

// Configuração do banco de dados
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Defina como true se estiver usando Azure
    trustServerCertificate: true, // Use true para ambientes de desenvolvimento
  }
};

// Função para conectar ao banco de dados
const connectToDatabase = async () => {
  try {
    await mssql.connect(config);
    console.log('Conectado ao banco de dados!');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};
// Endpoint to add a new user
app.post('/add-usuario', async (req, res) => {
  const { username, perfil, nome_completo } = req.body;

  if (!username || !perfil || !nome_completo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // Consulta o banco de dados para adicionar um novo usuário
    const request = new mssql.Request();
    request.input('username', mssql.VarChar, username);
    request.input('perfil', mssql.VarChar, perfil);
    request.input('nome_completo', mssql.VarChar, nome_completo);
    const result = await request.query('INSERT INTO dbo.usuarios (username, perfil, nome_completo) VALUES (@username, @perfil, @nome_completo)');

    return res.json({ message: 'Usuário adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(500).json({ error: 'Erro ao adicionar usuário' });
  }
});

// Endpoint para retornar todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    // Consulta o banco de dados para retornar todos os usuários
    const request = new mssql.Request();
    const result = await request.query('SELECT username, perfil, nome_completo FROM dbo.usuarios');

    return res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao retornar usuários:', error);
    return res.status(500).json({ error: 'Erro ao retornar usuários' });
  }
});

// Endpoint para validar o nome de usuário
app.post('/validateUser', async (req, res) => { // Removido espaço extra
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Nome de usuário não fornecido' });
  }

  try {
    // Consulta o banco de dados para verificar se o username existe
    const request = new mssql.Request();
    request.input('username', mssql.VarChar, username);
    const result = await request.query('SELECT * FROM dbo.usuarios WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    return res.json({ valid: true, usuario: result.recordset[0] });
  } catch (error) {
    console.error('Erro ao validar usuário:', error);
    return res.status(500).json({ error: 'Erro ao validar usuário' });
  }
});

// Conectar ao banco de dados e iniciar o servidor
const startServer = async () => {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
  });
};

startServer();