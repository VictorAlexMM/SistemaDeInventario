import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SystemInfo() {
  const [info, setInfo] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/system-info');
        setInfo(response.data.log);
      } catch (error) {
        console.error('Error fetching system info:', error);
      }
    };

    fetchInfo();
  }, []);

  return (
    <div>
      <h1>System Information</h1>
      <pre>{info}</pre>
    </div>
  );
}

export default SystemInfo;
