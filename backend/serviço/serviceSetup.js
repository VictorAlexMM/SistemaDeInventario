const path = require('path');
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'TESTE',
  description: 'Um serviço que coleta o hostname e a conta logada no PC.',
  script: path.join(__dirname, 'serviceWorker.js'),

});

svc.on('install', () => {
  svc.start();
});

svc.install();
