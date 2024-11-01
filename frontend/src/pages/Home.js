import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState({
    total_comodatos: 0,
    total_desktops: 0,
    total_notebooks: 0,
    total_servidor: 0,
  });
  
  const [changes, setChanges] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [selectedPlanta, setSelectedPlanta] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.get('http://mao-s038:3003/dashboard/contagem', {
        params: { planta: selectedPlanta }
      });
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const fetchRecentChanges = async () => {
    try {
      const response = await axios.get('http://mao-s038:3003/dashboard/recent-changes', {
        params: { planta: selectedPlanta }
      });
      setChanges(response.data);
    } catch (error) {
      console.error('Error fetching recent changes:', error);
    }
  };

  const fetchPlantas = async () => {
    try {
      const response = await axios.get('http://mao-s038:3003/dashboard/plantas');
      setPlantas(response.data);
    } catch (error) {
      console.error('Error fetching plantas:', error);
    }
  };

  useEffect(() => {
    fetchPlantas(); // Fetch plantas on component mount
  }, []);

  useEffect(() => {
    fetchData(); // Fetch data when selectedPlanta changes
    fetchRecentChanges(); // Fetch recent changes when selectedPlanta changes

    const interval = setInterval(() => {
      fetchData(); // Fetch data every 5 seconds
      fetchRecentChanges(); // Fetch changes every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [selectedPlanta]);

  const handlePlantaChange = (event) => {
    setSelectedPlanta(event.target.value);
  };

  const formatKey = (key) => {
    switch (key) {
      case 'total_servidor':
        return 'Servidores';
      case 'total_comodatos':
        return 'Comodatos';
      case 'total_desktops':
        return 'Desktops';
      case 'total_notebooks':
        return 'Notebooks';
      default:
        return key.replace('total_', '').charAt(0).toUpperCase() + key.slice(1);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Equipamentos
      </Typography>

      <FormControl
        variant="outlined"
        sx={{
          marginBottom: 2,
          minWidth: 200,
          position: 'absolute',
          right: 16,
          top: 100,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        <InputLabel id="select-planta-label">Planta</InputLabel>
        <Select
          labelId="select-planta-label"
          value={selectedPlanta}
          onChange={handlePlantaChange}
          label="Planta"
        >
          <MenuItem value="">
            <em>Escolha</em>
          </MenuItem>
          {plantas.map((planta) => (
            <MenuItem key={planta.planta} value={planta.planta}>
              {planta.planta}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {/* Render total_comodatos first */}
        {Object.entries(data).map(([key, value]) => {
          if (key === 'total_comodatos') {
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                  <Typography variant="h5">
                    {formatKey(key)}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            );
          }
          return null; // Return null for other keys
        })}

        {/* Render total_servidor second */}
        {Object.entries(data).map(([key, value]) => {
          if (key === 'total_servidor') {
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                  <Typography variant="h5">
                    {formatKey(key)}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            );
          }
          return null; // Return null for other keys
        })}

        {/* Render the rest of the components */}
        {Object.entries(data).map(([key, value]) => {
          if (key !== 'total_servidor' && key !== 'total_comodatos') {
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                  <Typography variant="h5">
                    {formatKey(key)}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            );
          }
          return null; // Return null for other keys
        })}
      </Grid>

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Changes/Additions
        </Typography>
        <List>
          {changes.map((change, index) => (
            <ListItem key={index}>
              <ListItemText primary={change.description} secondary={change.date} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Dashboard;
