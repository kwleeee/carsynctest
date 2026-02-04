// User roles and permissions utilities
export const userRoles = {
  VEHICLE_OWNER: 'owner',
  MECHANIC: 'mechanic',
  ADMIN: 'admin',
};

export const permissions = {
  [userRoles.VEHICLE_OWNER]: {
    canAddVehicle: true,
    canEditVehicle: true,
    canDeleteVehicle: true,
    canViewAppointments: true,
    canCreateAppointments: true,
    canViewInvoices: true,
    canMakePayments: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  [userRoles.MECHANIC]: {
    canAddVehicle: false,
    canEditVehicle: false,
    canDeleteVehicle: false,
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointmentStatus: true,
    canViewInvoices: true,
    canGenerateInvoices: true,
    canViewReports: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  [userRoles.ADMIN]: {
    canAddVehicle: true,
    canEditVehicle: true,
    canDeleteVehicle: true,
    canViewAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointmentStatus: true,
    canViewInvoices: true,
    canGenerateInvoices: true,
    canMakePayments: true,
    canViewReports: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
    canExportData: true,
    canManageSystem: true,
  },
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  return permissions[userRole]?.[permission] || false;
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [userRoles.VEHICLE_OWNER]: 'Vehicle Owner',
    [userRoles.MECHANIC]: 'Mechanic',
    [userRoles.ADMIN]: 'Admin',
  };
  return roleNames[role] || 'Unknown';
};

// Admin key validation
export const validateAdminKey = (key) => {
  if (!key) return false;
  
  // Trim and validate
  const trimmedKey = key.trim();
  
  // Check if it's 12 digits (demo requirement)
  if (/^\d{12}$/.test(trimmedKey)) {
    // Demo keys (in production, check against database)
    const validKeys = [
      '123456789012', // Demo admin key
      '987654321098', // Another demo key
      '111111111111', // Test key
    ];
    return validKeys.includes(trimmedKey);
  }
  
  // Also accept string keys for demo
  const validStringKeys = [
    'ADMIN2024KEY',
    'SUPERADMIN123',
    'MASTERKEY999',
  ];
  
  return validStringKeys.includes(trimmedKey);
};

// Generate a random 12-digit admin key (for demo purposes)
export const generateAdminKey = () => {
  return Array.from({ length: 12 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
};

// Get permissions for a specific role
export const getRolePermissions = (role) => {
  return permissions[role] || permissions[userRoles.VEHICLE_OWNER];
};

// Check if user can access route
export const canAccessRoute = (userRole, route) => {
  const routePermissions = {
    '/admin': 'canAccessAdminPanel',
    '/reports': 'canViewReports',
    '/users': 'canManageUsers',
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Public route
  
  return hasPermission(userRole, requiredPermission);
};