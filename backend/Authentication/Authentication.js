const express = require('express');
const mssql = require('mssql');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Habilita CORS
app.use(cors());

// Middleware para analisar JSON
app.use(express.json());

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

// Função para obter detalhes do usuário do banco de dados
const getUserDetailsFromDB = async (username) => {
  const query = 'SELECT username, password FROM dbo.usuarios WHERE username = @username';
  const request = new mssql.Request(pool);
  request.input('username', mssql.VarChar, username);
  const results = await request.query(query);
  return results.recordset.length > 0 ? results.recordset[0] : null;
};

// Função para gerar token JWT
const generateToken = (username) => {
  return jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Função para comparar senha
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Swagger
const swaggerDefinition = {
  openapi: '3.0.1',
  info: {
    title: 'BMS',
    version: '1',
  },
  paths: {
    '/api/v1/AuthAd': {
      post: {
        tags: ['AuthAd'],
        summary: 'Autenticar no AD',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserToken',
                },
              },
            },
          },
          401: {
            description: 'Usuário não autenticado',
          },
          404: {
            description: 'Usuário não cadastrado',
          },
          500: {
            description: 'Internal Server Error',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      },
      UserToken: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
      },
    },
  },
};

// Endpoint de autenticação
app.post('/api/v1/AuthAd', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Registra o username no banco de dados
    const insertQuery = 'INSERT INTO dbo.usuarios (username) VALUES (@username) ON DUPLICATE KEY UPDATE username = @username';
    const insertRequest = new mssql.Request(pool);
    insertRequest.input('username', mssql.VarChar, username);
    await insertRequest.query(insertQuery);

    // Verifica se o usuário existe
    const user = await getUserDetailsFromDB(username);
    
    // Verifica a senha
    if (user) {
      const isValid = await comparePassword(password, user.password);
      if (isValid) {
        const token = generateToken(user.username);
        return res.json({ token });
      } else {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' });
      }
    } else {
      // Se o usuário não existe, podemos considerar que a autenticação falhou
      return res.status(404).json({ error: 'Usuário não cadastrado' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
