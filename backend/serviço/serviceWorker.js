const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');

function logSystemInfo() {
  const hostname = os.hostname().replace(/^PC/, '');

  exec('whoami', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao executar o comando whoami: ${error}`);
      return;
    }

    const loggedUser  = stdout.trim();

    const logMessage = {
      hostname: hostname,
      accountName: loggedUser ,
    };
    axios.post('http://localhost:3001/api/system-info', logMessage)
      .then(response => console.log('Info sent to API Server:', response.data))
      .catch(error => console.error('Error sending info to API Server:', error));
  });
}

setInterval(logSystemInfo, 60000);
logSystemInfo();