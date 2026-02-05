import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Chip, CircularProgress, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const Inventory = () => {
  // 1. Initialize with EMPTY array (No Mock Data)
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    part_name: '', sku: '', quantity: '', unit_price: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      if (res.data.success) {
        // Only load real data from database
        setParts(res.data.parts);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ part_name: '', sku: '', quantity: '', unit_price: '' });
    setOpen(true);
  };

  const handleEdit = (part) => {
    setEditingId(part.part_id);
    setFormData({
      part_name: part.part_name,
      sku: part.sku || '',
      quantity: part.quantity,
      unit_price: part.unit_price
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      // Remove from UI immediately after successful DB delete
      setParts(parts.filter(p => p.part_id !== id));
    } catch (err) {
      alert("Failed to delete item. Check console.");
      console.error(err);
    }
  };

  const handleSave = async () => {
    // 1. Validation
    if (!formData.part_name || formData.quantity === '') {
      alert("Part Name and Quantity are required!");
      return;
    }

    // 2. Data Cleaning (Force numbers)
    const payload = {
      part_name: formData.part_name,
      sku: formData.sku,
      quantity: parseInt(formData.quantity) || 0,
      unit_price: parseFloat(formData.unit_price) || 0.00
    };

    try {
      // === EDIT MODE ===
      if (editingId) {
        await axios.put(`http://localhost:5000/api/inventory/${editingId}`, payload);
      } 
      // === ADD MODE ===
      else {
        await axios.post('http://localhost:5000/api/inventory', payload);
      }
      
      setOpen(false);
      loadInventory(); // Refresh list from DB

    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Parts Inventory</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          Add New Part
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Part Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Inventory is empty. Add your first part!
                </TableCell>
              </TableRow>
            ) : (
              parts.map((part) => (
                <TableRow key={part.part_id}>
                  <TableCell fontWeight="bold">{part.part_name}</TableCell>
                  <TableCell>{part.sku || '-'}</TableCell>
                  <TableCell>${Number(part.unit_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={part.quantity} 
                      color={part.quantity < 5 ? 'error' : 'success'} 
                      variant="outlined" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(part)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(part.part_id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* POPUP FORM */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Part" : "Add New Part"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Part Name" fullWidth 
              value={formData.part_name} 
              onChange={(e) => setFormData({...formData, part_name: e.target.value})} 
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="SKU (Optional)" fullWidth 
                value={formData.sku} 
                onChange={(e) => setFormData({...formData, sku: e.target.value})} 
              />
              <TextField label="Quantity" type="number" fullWidth 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              />
            </Box>
            <TextField label="Unit Price ($)" type="number" fullWidth 
              value={formData.unit_price} 
              onChange={(e) => setFormData({...formData, unit_price: e.target.value})} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleSave} variant="contained">{editingId ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
