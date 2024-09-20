const path = require('path');
const Service = require('node-windows').Service;

// Crie uma instância do serviço
const svc = new Service({
  name: 'APIPORTAL',
  description: 'Um serviço que coleta o hostname e a conta logada no PC.',
  script: path.join(__dirname, 'serviceWorker.js'),
  // Opcional: Defina um usuário e senha para o serviço se necessário
  // username: 'YOUR_USERNAME',
  // password: 'YOUR_PASSWORD',
});

// Escute eventos de instalação
svc.on('install', () => {
  svc.start();
});

// Instale o serviço
svc.install();
