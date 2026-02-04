import React from 'react';
import { Chip, Box, Tooltip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const RoleBadge = ({ role, size = 'medium' }) => {
  const roleConfig = {
    admin: {
      label: 'Admin',
      color: 'error',
      icon: <SecurityIcon />,
      tooltip: 'System Administrator - Full access',
    },
    mechanic: {
      label: 'Mechanic',
      color: 'warning',
      icon: <BuildIcon />,
      tooltip: 'Service Technician - Can manage appointments and services',
    },
    vehicle_owner: {
      label: 'Vehicle Owner',
      color: 'success',
      icon: <DirectionsCarIcon />,
      tooltip: 'Vehicle Owner - Can manage personal vehicles',
    },
  };

  const config = roleConfig[role] || roleConfig.vehicle_owner;

  return (
    <Tooltip title={config.tooltip}>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size={size}
        sx={{
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'inherit',
          }
        }}
      />
    </Tooltip>
  );
};

export default RoleBadge;