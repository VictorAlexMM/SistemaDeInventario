const express = require('express');
const mssql = require('mssql');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Habilita CORS
app.use(cors());

// Middleware para analisar JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do banco de dados
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

// Conectar ao banco de dados
let pool;
mssql.connect(config)
  .then(connectionPool => {
    pool = connectionPool;
    console.log('Conectado ao banco de dados!');
  })
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// Validação de entrada
const validateInput = (req, res, next) => {
  const { username, password, nomeCompleto } = req.body;
  if (req.path === '/login') {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios para login' });
    }
  } else {
    if (!username || !password || !nomeCompleto) {
      return res.status(400).json({ error: 'Username, password e nome completo são obrigatórios para criação de usuário' });
    }
    if (username.length < 3 || password.length < 8) {
      return res.status(400).json({ error: 'Username deve ter pelo menos 3 caracteres e a senha deve ter pelo menos 8 caracteres' });
    }
  }
  next();
};

// Middleware de limitação de taxa para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  delayMs: 0,
});

// Funções de hash e comparação de senha
const bcryptSaltRounds = 10;

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(bcryptSaltRounds);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Função para gerar token JWT
const generateToken = (username, perfil) => {
  return jwt.sign({ username, perfil }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Função para obter detalhes do usuário do banco de dados
const getUserDetailsFromDB = async (username) => {
  const query = 'SELECT password, perfil FROM dbo.usuarios WHERE username = @username';
  const request = new mssql.Request(pool);
  request.input('username', mssql.VarChar, username);
  const results = await request.query(query);
  if (results.recordset.length > 0) {
    return results.recordset[0];
  } else {
    throw new Error('Usuário não encontrado');
  }
};

// Middleware para verificar o perfil do usuário
const verifyProfile = (requiredProfile) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (decoded.perfil !== requiredProfile) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

// Endpoint de login
app.post('/login', loginLimiter, validateInput, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await getUserDetailsFromDB(username);
    const isValid = await comparePassword(password, user.password);

    if (isValid) {
      const token = generateToken(user.username, user.perfil);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(401).json({ error: 'Erro ao fazer login' });
  }
});

// Endpoint para criar usuário
app.post('/criar-usuario', validateInput, async (req, res) => {
  try {
    const { username, password, nomeCompleto } = req.body;

    // Verifique se o usuário já existe
    try {
      await getUserDetailsFromDB(username);
      return res.status(400).json({ error: 'Usuário já existe' });
    } catch (error) {
      if (error.message !== 'Usuário não encontrado') {
        throw error; // Propaga outros erros
      }
    }

    const hashedPassword = await hashPassword(password);

    // Define o perfil como "user"
    const perfil = 'user';

    const query = 'INSERT INTO dbo.usuarios (username, password, nome_completo, perfil) VALUES (@username, @password, @nomeCompleto, @perfil)';
    const request = new mssql.Request(pool);
    request.input('username', mssql.VarChar, username);
    request.input('password', mssql.VarChar, hashedPassword);
    request.input('nomeCompleto', mssql.VarChar, nomeCompleto);
    request.input('perfil', mssql.VarChar, perfil);
    
    await request.query(query);
    res.json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Rotas protegidas
app.get('/admin-endpoint', verifyProfile('admin'), (req, res) => {
  res.send('Conteúdo da página admin');
});

app.get('/inventario', verifyProfile('user'), (req, res) => {
  res.send('Conteúdo do inventário');
});

app.get('/comodato', verifyProfile('user'), (req, res) => {
  res.send('Conteúdo do comodato');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
