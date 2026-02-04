// src/utils/permissions.js

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
    canUpdateAppointmentStatus: true, // This is what the button needs!
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

export const hasPermission = (userRole, permission) => {
  return permissions[userRole]?.[permission] || false;
};