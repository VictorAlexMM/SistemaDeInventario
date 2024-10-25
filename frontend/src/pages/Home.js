// Home.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';
import MudancaRecente from '../components/MudancaRecente'

const Home = () => {
  const [data, setData] = useState({
    total_comodatos: 0,
    total_desktops: 0,
    total_notebooks: 0,
    total_switches: 0,
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3003/dashboard/contagem');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount

    const interval = setInterval(() => {
      fetchData(); // Fetch data every 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formatKey = (key) => {
    // Remove the 'total_' prefix and format the string correctly
    switch (key) {
      case 'total_comodatos':
        return 'Comodatos';
      case 'total_desktops':
        return 'Desktops';
      case 'total_notebooks':
        return 'Notebooks';
      case 'total_switches':
        return 'Switches';
      default:
        return key.replace('total_', '').charAt(0).toUpperCase() + key.slice(1);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Equipamentos
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(data).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
              <Typography variant="h5">
                {formatKey(key)} {/* Use the formatKey function to display the correct name */}
              </Typography>
              <Typography variant="h6">{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Incorporando o componente MudancaRecente */}
      <MudancaRecente />
    </Box>
  );
};

export default Home;