const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kashvin08_',
  database: process.env.DB_NAME || 'carsync_db',
  waitForConnections: true,
  connectionLimit: 10
});

// --- HELPER FUNCTIONS ---
const convertTo24Hour = (timeStr) => {
  if (!timeStr || !timeStr.includes(' ')) return timeStr || "09:00:00";
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
};

// ============ AUTHENTICATION ============
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, user_type, phone, address, adminKey } = req.body;
  try {
    if (!full_name || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
    if (user_type === 'admin' && adminKey !== '123456789012') return res.status(403).json({ success: false, message: "Invalid Key" });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Check if email exists
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if(results.length > 0) return res.status(400).json({ success: false, message: "Email already exists" });
        
        const query = `INSERT INTO users (full_name, email, password_hash, user_type, phone, address, account_status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`;
        pool.query(query, [full_name, email, password_hash, user_type || 'owner', phone || null, address || null], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, userId: result.insertId });
        });
    });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });
    bcrypt.compare(password, results[0].password_hash, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ success: false, message: 'Wrong password' });
      const user = results[0]; delete user.password_hash;
      res.json({ success: true, user, token: `token-${user.user_id}` });
    });
  });
});

// ============ VEHICLES ============
app.get('/api/users/:userId/vehicles', (req, res) => {
  pool.query('SELECT * FROM vehicles WHERE user_id = ?', [req.params.userId], (err, results) => {
    res.json({ success: true, vehicles: results });
  });
});

app.post('/api/users/:userId/vehicles', (req, res) => {
  const { make, model, year, license_plate, color, fuel_type, current_mileage } = req.body;
  const query = `INSERT INTO vehicles (user_id, make, model, year, license_plate, color, fuel_type, current_mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  pool.query(query, [req.params.userId, make, model, year, license_plate, color, fuel_type, current_mileage], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, vehicle: { vehicle_id: result.insertId, ...req.body } });
  });
});

app.delete('/api/vehicles/:vehicleId', (req, res) => {
  pool.query('DELETE FROM vehicles WHERE vehicle_id = ?', [req.params.vehicleId], (err) => {
    res.json({ success: !err });
  });
});

// ============ APPOINTMENTS ============
app.get('/api/users/:userId/appointments', (req, res) => {
  const query = `SELECT a.*, v.make, v.model, v.license_plate FROM appointments a LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id WHERE a.user_id = ? ORDER BY a.appointment_date DESC`;
  pool.query(query, [req.params.userId], (err, results) => {
    res.json({ success: true, appointments: results });
  });
});

app.post('/api/appointments', (req, res) => {
  const { user_id, vehicle_id, service_type, appointment_date, appointment_time, notes, urgency, workshop_id } = req.body;
  const formattedTime = convertTo24Hour(appointment_time);
  const query = `INSERT INTO appointments (user_id, vehicle_id, service_type, appointment_date, appointment_time, notes, status, urgency, workshop_id) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`;
  pool.query(query, [user_id, vehicle_id, service_type, appointment_date, formattedTime, notes || '', urgency || 'normal', workshop_id || null], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, appointmentId: result.insertId });
  });
});

app.put('/api/appointments/:id/status', (req, res) => {
  pool.query('UPDATE appointments SET status = ? WHERE appointment_id = ?', [req.body.status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    
    // Auto-Log Maintenance when Completed
    if (req.body.status === 'completed') {
        const copyQuery = `
          INSERT INTO maintenance_logs (user_id, vehicle_id, service_type, service_date, notes, mileage, cost)
          SELECT user_id, vehicle_id, service_type, appointment_date, notes, 0, 0
          FROM appointments WHERE appointment_id = ?`;
        pool.query(copyQuery, [req.params.id], (copyErr) => {
          if (copyErr) console.error("⚠️ Failed to auto-log maintenance:", copyErr);
        });
    }
    res.json({ success: true });
  });
});

// ============ MAINTENANCE LOGS (New Feature) ============
app.get('/api/users/:userId/maintenance', (req, res) => {
  const query = `
    SELECT m.*, v.make, v.model, v.license_plate 
    FROM maintenance_logs m 
    JOIN vehicles v ON m.vehicle_id = v.vehicle_id 
    WHERE m.user_id = ? 
    ORDER BY m.service_date DESC`;
  
  pool.query(query, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, logs: results });
  });
});

app.post('/api/maintenance', (req, res) => {
  const { user_id, vehicle_id, service_type, service_date, mileage, cost, notes } = req.body;
  const query = `INSERT INTO maintenance_logs (user_id, vehicle_id, service_type, service_date, mileage, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  pool.query(query, [user_id, vehicle_id, service_type, service_date, mileage, cost, notes], (err, result) => {
    if (err) {
        console.error("Maintenance Log Error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: "Log added" });
  });
});

// ============ PARTS INVENTORY (New Feature) ============
app.get('/api/inventory', (req, res) => {
  pool.query('SELECT * FROM parts_inventory ORDER BY part_name ASC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, parts: results });
  });
});

app.post('/api/inventory', (req, res) => {
  const { part_name, sku, quantity, unit_price } = req.body;
  
  // 🛡️ SAFEGUARDS: Prevent crashes
  const safeSku = sku && sku.trim() !== '' ? sku : null;
  const safeQty = parseInt(quantity) || 0;
  const safePrice = parseFloat(unit_price) || 0.00;

  const query = `INSERT INTO parts_inventory (part_name, sku, quantity, unit_price) VALUES (?, ?, ?, ?)`;
  pool.query(query, [part_name, safeSku, safeQty, safePrice], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Part added' });
  });
});

app.put('/api/inventory/:id', (req, res) => {
  const { part_name, sku, quantity, unit_price } = req.body;
  const safeSku = sku && sku.trim() !== '' ? sku : null;
  const safeQty = parseInt(quantity) || 0;
  const safePrice = parseFloat(unit_price) || 0.00;

  const query = `UPDATE parts_inventory SET part_name = ?, sku = ?, quantity = ?, unit_price = ? WHERE part_id = ?`;
  pool.query(query, [part_name, safeSku, safeQty, safePrice, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/inventory/:id', (req, res) => {
  pool.query('DELETE FROM parts_inventory WHERE part_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// ============ INVOICES & ADMIN ============
app.get('/api/users/:userId/invoices', (req, res) => {
  pool.query('SELECT * FROM invoices WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, invoices: results });
  });
});

app.post('/api/invoices', (req, res) => {
    const { user_id, vehicle_id, appointment_id, service_type, total_amount, payment_status } = req.body;
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 7);
    const query = `INSERT INTO invoices (user_id, vehicle_id, appointment_id, service_type, service_description, total_amount, tax_amount, payment_status, invoice_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;
    pool.query(query, [user_id, vehicle_id, appointment_id || null, service_type, service_type, total_amount, 0.00, payment_status || 'pending', dueDate.toISOString().split('T')[0]], (err, result) => {
      if (err) return res.status(500).json({ success: false });
      if (appointment_id) pool.query('UPDATE appointments SET status = "completed" WHERE appointment_id = ?', [appointment_id]);
      res.json({ success: true, invoiceId: result.insertId });
    });
  });

app.get('/api/admin/users', (req, res) => {
  pool.query('SELECT user_id, full_name, email, user_type, account_status, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, users: results });
  });
});

app.delete('/api/admin/users/:userId', (req, res) => {
  pool.query('DELETE FROM users WHERE user_id = ?', [req.params.userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "User deleted" });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
