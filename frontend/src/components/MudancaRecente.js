// MudancaRecente.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Card, CardContent, Divider } from '@mui/material';
import axios from 'axios';

const MudancaRecente = () => {
  const [changes, setChanges] = useState([]);

  const fetchRecentChanges = async () => {
    try {
      const response = await axios.get('http://localhost:3003/api/controleInventario/ultimas-alteracoes');
      setChanges(response.data); // Assuming the response is an array of changes
    } catch (error) {
      console.error('Erro ao buscar últimas alterações:', error);
    }
  };

  useEffect(() => {
    fetchRecentChanges(); // Fetch recent changes on component mount

    const interval = setInterval(() => {
      fetchRecentChanges(); // Fetch recent changes every 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Box sx={{ marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Últimas Alterações/Adições
      </Typography>
      <List>
        {changes.map((change, index) => (
          <Card key={index} sx={{ marginBottom: 2 }}>
            <CardContent>
              <ListItem>
                <ListItemText 
                  primary={change.descricao} 
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {change.data}
                      </Typography>
                      {change.criadoPor && (
                        <Typography variant="body2" color="text.secondary">
                          Criado por: {change.criadoPor}
                        </Typography>
                      )}
                      {change.alteradoPor && (
                        <Typography variant="body2" color="text.secondary">
                          Alterado por: {change.alteradoPor}
                        </Typography>
                      )}
                    </>
                  } 
                />
              </ListItem>
            </CardContent>
            <Divider />
          </Card>
        ))}
      </List>
    </Box>
  );
};

export default MudancaRecente;