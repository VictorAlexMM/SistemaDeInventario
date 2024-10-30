const path = require('path');
const Service = require('node-windows').Service;

// Crie uma instância do serviço
const svc = new Service({
  name: 'TESTE',
  description: 'Um serviço que coleta o hostname e a conta logada no PC.',
  script: path.join(__dirname, 'serviceWorker.js'),

});

// Escute eventos de instalação
svc.on('install', () => {
  svc.start();
});

// Instale o serviço
svc.install();
