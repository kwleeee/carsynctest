import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 12px 48px rgba(255, 45, 85, 0.2)`,
  },
}));

const VehicleCard = ({ vehicle }) => {
  return (
    <StyledCard>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 56, 
              height: 56, 
              backgroundColor: 'rgba(255, 45, 85, 0.1)',
              border: '2px solid rgba(255, 45, 85, 0.3)'
            }}>
              <DirectionsCarIcon sx={{ color: '#ff2d55', fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {vehicle.make} {vehicle.model}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vehicle.year} • {vehicle.licensePlate}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 2,
          mb: 3 
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 20, color: '#007aff', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">Mileage</Typography>
            <Typography variant="h6">{vehicle.mileage.toLocaleString()} mi</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <LocalGasStationIcon sx={{ fontSize: 20, color: '#34c759', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">MPG</Typography>
            <Typography variant="h6">{vehicle.mpg || '--'}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 20, color: '#ff9500', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">Next Service</Typography>
            <Typography variant="h6">{vehicle.nextService || '--'}</Typography>
          </Box>
        </Box>

        {/* Status & Health */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={vehicle.status || 'Active'} 
            size="small"
            sx={{
              backgroundColor: vehicle.status === 'Active' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)',
              color: vehicle.status === 'Active' ? '#34c759' : '#ff9500',
              fontWeight: 500
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">Health:</Typography>
            <Box sx={{ 
              width: 60, 
              height: 4, 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                width: `${vehicle.health || 85}%`, 
                height: '100%',
                background: `linear-gradient(90deg, ${vehicle.health > 70 ? '#34c759' : vehicle.health > 40 ? '#ff9500' : '#ff2d55'}, ${vehicle.health > 70 ? '#30d158' : vehicle.health > 40 ? '#ff9f0a' : '#ff375f'})`,
              }} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default VehicleCard;