import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiServices from '../services/api';
const userService = apiServices.userService;

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
}));

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Edit user form
  const [editForm, setEditForm] = useState({
    user_type: '',
    account_status: '',
  });

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    mechanics: 0,
    owners: 0,
    suspended: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);
      
      const isAdmin = parsedUser.user_type === 'admin' || parsedUser.role === 'admin';
      
      if (!isAdmin) {
        setNotification({
          open: true,
          message: 'Access denied. Admin privileges required.',
          severity: 'error'
        });
        return;
      }
      
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('👑 Fetching real-time users from MySQL...');
      
      // CALLING THE REAL BACKEND API
      const response = await userService.fetchAllUsers();
      
      if (response && response.success) {
        const uniqueUsers = response.users || [];
        setUsers(uniqueUsers);
        calculateStats(uniqueUsers);
        console.log('✅ Loaded users from DB:', uniqueUsers.length);
      } else {
        throw new Error(response.message || 'Failed to fetch');
      }
      
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setNotification({
        open: true,
        message: 'Failed to load users from Database. Make sure server is running.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const statsData = {
      totalUsers: userList.length,
      activeUsers: userList.filter(u => u.account_status === 'active').length,
      admins: userList.filter(u => u.user_type === 'admin').length,
      mechanics: userList.filter(u => u.user_type === 'mechanic').length,
      owners: userList.filter(u => u.user_type === 'owner').length,
      suspended: userList.filter(u => u.account_status === 'suspended').length,
    };
    setStats(statsData);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      user_type: user.user_type || 'owner',
      account_status: user.account_status || 'active',
    });
    setEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      console.log('🔄 Updating user in DB:', selectedUser.user_id, editForm);
      
      // CALLING REAL DB UPDATE
      const response = await userService.updateUserByAdmin(selectedUser.user_id, editForm);
      
      if (response.success) {
        setNotification({
          open: true,
          message: `User ${selectedUser.email} updated successfully`,
          severity: 'success'
        });
        setEditUserDialog(false);
        loadUsers(); // Refresh the list from DB
      }
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      setNotification({
        open: true,
        message: 'Failed to update user in Database',
        severity: 'error'
      });
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.account_status === 'active' ? 'suspended' : 'active';
      console.log('🔄 Toggling status in DB:', user.user_id, newStatus);

      // CALLING REAL DB UPDATE
      const response = await userService.updateUserByAdmin(user.user_id, { 
        user_type: user.user_type, // keep current role
        account_status: newStatus 
      });
      
      if (response.success) {
        setNotification({
          open: true,
          message: `User ${user.email} ${newStatus === 'active' ? 'activated' : 'suspended'}`,
          severity: 'success'
        });
        loadUsers(); // Refresh the list from DB
      }
      
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      setNotification({
        open: true,
        message: 'Failed to update user status in Database',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      // CALLING REAL DB DELETE
      const response = await userService.deleteUser(user.user_id);
      
      if (response.success) {
        setNotification({
          open: true,
          message: `User ${user.email} deleted successfully from DB`,
          severity: 'success'
        });
        loadUsers(); // Refresh list
      }
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      setNotification({
        open: true,
        message: 'Failed to delete user from Database',
        severity: 'error'
      });
    }
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        user_type: user.user_type,
        account_status: user.account_status,
        created_at: user.created_at,
        last_login: user.last_login
      })),
      statistics: stats,
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carsync-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setNotification({
      open: true,
      message: 'Data exported successfully!',
      severity: 'success'
    });
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.includes(searchTerm))
    );
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'mechanic': return 'warning';
      case 'owner': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'mechanic': return 'Mechanic';
      case 'owner': return 'Owner';
      default: return 'User';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading admin panel...</Typography>
      </Box>
    );
  }

  // Check if current user is admin
  if (currentUser && currentUser.user_type !== 'admin' && currentUser.role !== 'admin') {
      return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You don't have administrator privileges to access this page.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href='/dashboard'}
          >
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 700, mb: 0.5, fontSize: '2.5rem' }}>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2.5rem' }} />
            Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System Administration & User Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            sx={{
              background: 'linear-gradient(135deg, #007aff 0%, #5ac8fa 100%)',
            }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success" sx={{ fontWeight: 700 }}>
                {stats.activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error" sx={{ fontWeight: 700 }}>
                {stats.admins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning" sx={{ fontWeight: 700 }}>
                {stats.mechanics}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mechanics
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info" sx={{ fontWeight: 700 }}>
                {stats.owners}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vehicle Owners
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Current User Info */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        icon={<SecurityIcon />}
      >
        <Typography variant="subtitle2">
          Logged in as: {currentUser?.full_name} ({currentUser?.email})
        </Typography>
        <Typography variant="body2">
          User Type: <Chip label={getRoleLabel(currentUser?.user_type)} color={getRoleColor(currentUser?.user_type)} size="small" />
          {' • '}
          Status: <Chip label={currentUser?.account_status || 'active'} color={getStatusColor(currentUser?.account_status)} size="small" />
        </Typography>
      </Alert>

      {/* Search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search users by email, name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Showing {filteredUsers.length} of {users.length} users
        </Typography>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ 
        backgroundColor: 'rgba(28, 28, 30, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No users found in database
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id} hover>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      #{user.user_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {user.full_name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.user_type)}
                      color={getRoleColor(user.user_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.account_status || 'active'}
                      color={getStatusColor(user.account_status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditUser(user)}
                        disabled={user.user_id === currentUser?.user_id}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color={user.account_status === 'active' ? 'warning' : 'success'}
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={user.user_id === currentUser?.user_id}
                      >
                        {user.account_status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.user_id === currentUser?.user_id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog 
        open={editUserDialog} 
        onClose={() => setEditUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>Edit User Settings</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    User: {selectedUser.full_name} ({selectedUser.email})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>User Role</InputLabel>
                    <Select
                      value={editForm.user_type}
                      onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}//update user type on change
                      label="User Role"
                    >
                      <MenuItem value="owner">Vehicle Owner</MenuItem>
                      <MenuItem value="mechanic">Mechanic</MenuItem>
                      <MenuItem value="admin">Administrator</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Account Status</InputLabel>
                    <Select
                      value={editForm.account_status}
                      onChange={(e) => setEditForm({ ...editForm, account_status: e.target.value })}
                      label="Account Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateUser} 
                variant="contained"
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* System Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>System Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <BarChartIcon sx={{ fontSize: 40, color: '#007aff', mb: 1 }} />
              <Typography variant="subtitle1">System Analytics</Typography>
              <Typography variant="caption" color="text.secondary">
                View system usage statistics
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <VpnKeyIcon sx={{ fontSize: 40, color: '#ff2d55', mb: 1 }} />
              <Typography variant="subtitle1">Admin Keys</Typography>
              <Typography variant="caption" color="text.secondary">
                Manage admin registration keys
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: '#34c759', mb: 1 }} />
              <Typography variant="subtitle1">Security Logs</Typography>
              <Typography variant="caption" color="text.secondary">
                View security and access logs
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <DownloadIcon sx={{ fontSize: 40, color: '#ff9500', mb: 1 }} />
              <Typography variant="subtitle1">Database Backup</Typography>
              <Typography variant="caption" color="text.secondary">
                Create system backup
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;