const express = require('express');//server framework
const mysql = require('mysql2');//mysql db which is faster/prevents injections
const cors = require('cors');//talk to frontend
const bcrypt = require('bcryptjs');//pw hash
require('dotenv').config();//.env to store sensitive info (DB creds)

const app = express();//init express as app (defines middleware, routing, server settings)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));//app allow 3000 to talk to 5000
app.use(express.json());//app parse requests with json payloads for react to read (lightweight & default format).
//app.use is essentially a pipeline for requests or code gets messy

const pool = mysql.createPool({//create mysql connection pool (to reuse connections, better performance, more doors open)
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kashvin08_',
  database: process.env.DB_NAME || 'carsync_db',
  waitForConnections: true,//prevents overload
  connectionLimit: 10//max connections (10 open doors)
});

//time conversion
const convertTo24Hour = (timeStr) => {
  if (!timeStr || !timeStr.includes(' ')) return timeStr || "09:00:00";//default 9am
  const [time, modifier] = timeStr.split(' ');//splits "02:30 PM" to ["02:30", "PM"]
  let [hours, minutes] = time.split(':');//splits "02:30" to ["02", "30"]
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;//convert PM to 24hr base 10
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;//ensures 2 digits 9 to 09
};

//auth
app.post('/api/auth/register', async (req, res) => {//post requests only (routing example)
  const { full_name, email, password, user_type, phone, address, adminKey } = req.body;//destructure from req body and create individual vars
  try {
    if (!full_name || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });//error 400
    if (user_type === 'admin' && adminKey !== '123456789012') return res.status(403).json({ success: false, message: "Invalid Key" });

    const salt = await bcrypt.genSalt(10);//generate salt for hashing (diff characters even if same pw)
    const password_hash = await bcrypt.hash(password, salt);//hash pw with salt
    const query = `INSERT INTO users (full_name, email, password_hash, user_type, phone, address, account_status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`;//? are placeholders to prevent injection 
    pool.query(query, [full_name, email, password_hash, user_type || 'owner', phone || null, address || null], (err, result) => {//send to db (err, result doesnt wait for database to respond, moves on)
      if (err) return res.status(500).json({ success: false, message: err.message });//500 error if mysql crash/issue
      res.json({ success: true, userId: result.insertId });//sends success message with new user id to react
    });
  } catch (err) { res.status(500).json({ success: false }); }//catch any other errors and display error 500 (internal server error)
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;//destructure email and pw from req body
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {//query db for user with email
    if (err || results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });//401 unauthorized if error or no user found
    bcrypt.compare(password, results[0].password_hash, (err, isMatch) => {//compare pw with hashed pw in db
      if (!isMatch) return res.status(401).json({ success: false, message: 'Wrong password' });
      const user = results[0]; delete user.password_hash;//remove pw hash from user object before sending to frontend
      res.json({ success: true, user, token: `token-${user.user_id}` });//send success msg with user id
    });
  });
});

//vehicles
app.get('/api/users/:userId/vehicles', (req, res) => {
  pool.query('SELECT * FROM vehicles WHERE user_id = ?', [req.params.userId], (err, results) => {//query db for vehicles with user id from url param
    res.json({ success: true, vehicles: results });//send success msg with vehicles array
  });//req.params is an object that contains properties mapped to segments in the url path
});

app.post('/api/users/:userId/vehicles', (req, res) => {
  const { make, model, year, license_plate, color, fuel_type, current_mileage } = req.body;//destructure vehicle data from req body
  const query = `INSERT INTO vehicles (user_id, make, model, year, license_plate, color, fuel_type, current_mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;//? are placeholders to prevent injection
  pool.query(query, [req.params.userId, make, model, year, license_plate, color, fuel_type, current_mileage], (err, result) => {//query db to insert new vehicle
    if (err) return res.status(500).json({ success: false });//500 error if mysql crash/issue
    res.json({ success: true, vehicle: { vehicle_id: result.insertId, ...req.body } });//send success msg with new vehicle data
  });
});

app.put('/api/vehicles/:vehicleId', (req, res) => {
  const { make, model, year, license_plate, color, fuel_type, current_mileage } = req.body;
  const query = `UPDATE vehicles SET make = ?, model = ?, year = ?, license_plate = ?, color = ?, fuel_type = ?, current_mileage = ? WHERE vehicle_id = ?`;
  pool.query(query, [make, model, year, license_plate, color, fuel_type, current_mileage, req.params.vehicleId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.delete('/api/vehicles/:vehicleId', (req, res) => {
  pool.query('DELETE FROM vehicles WHERE vehicle_id = ?', [req.params.vehicleId], (err) => {
    res.json({ success: !err });//if err show false else true
  });
});

//appointments
app.get('/api/users/:userId/appointments', (req, res) => {
  const query = `SELECT a.*, v.make, v.model, v.license_plate FROM appointments a LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id WHERE a.user_id = ? ORDER BY a.appointment_date DESC`;
  pool.query(query, [req.params.userId], (err, results) => {
    res.json({ success: true, appointments: results });
  });
});

app.post('/api/appointments', (req, res) => {
  const { user_id, vehicle_id, service_type, appointment_date, appointment_time, notes, urgency, workshop_id } = req.body;//destructure appointment data from req body
  const formattedTime = convertTo24Hour(appointment_time);//convert to 24hr format
  const query = `INSERT INTO appointments (user_id, vehicle_id, service_type, appointment_date, appointment_time, notes, status, urgency, workshop_id) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`;
  pool.query(query, [user_id, vehicle_id, service_type, appointment_date, formattedTime, notes || '', urgency || 'normal', workshop_id || null], (err, result) => {
    if (err) return res.status(500).json({ success: false });//500 error if mysql crash/issue
    res.json({ success: true, appointmentId: result.insertId });//send success msg with new appointment id
  });
});

app.put('/api/appointments/:id/status', (req, res) => {
  pool.query('UPDATE appointments SET status = ? WHERE appointment_id = ?', [req.body.status, req.params.id], (err) => {//req.body for content and req.params for target of the change
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.put('/api/appointments/:id/cancel', (req, res) => {
  const query = `UPDATE appointments SET status = 'cancelled', notes = CONCAT(COALESCE(notes, ''), ' | Reason: ', ?) WHERE appointment_id = ?`;
  pool.query(query, [req.body.reason, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

//mechanic specific
app.get('/api/mechanic/appointments', (req, res) => {
  const query = `SELECT a.*, v.make, v.model, v.license_plate, u.full_name as customer_name FROM appointments a LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id LEFT JOIN users u ON a.user_id = u.user_id ORDER BY a.appointment_date ASC`;
  pool.query(query, (err, results) => res.json({ success: true, appointments: results }));
});

//invoice & maintenance
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

//fetch invoices for user
app.get('/api/users/:userId/invoices', (req, res) => {
  pool.query('SELECT * FROM invoices WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, invoices: results });
  });
});

app.get('/api/users/:userId/maintenance', (req, res) => {
  const query = `SELECT i.*, v.make, v.model, v.license_plate FROM invoices i LEFT JOIN vehicles v ON i.vehicle_id = v.vehicle_id WHERE i.user_id = ? ORDER BY i.invoice_date DESC`;
  pool.query(query, [req.params.userId], (err, results) => res.json({ success: true, logs: results }));
});

//admin
app.get('/api/admin/users', (req, res) => {
  pool.query('SELECT user_id, full_name, email, user_type, account_status, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, users: results });
  });
});

app.put('/api/admin/users/:userId', (req, res) => {
  const { user_type, account_status } = req.body;
  pool.query('UPDATE users SET user_type = ?, account_status = ? WHERE user_id = ?', [user_type, account_status, req.params.userId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

//delete user (admin)
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;//pluck userId from object req.params

  console.log(`🗑️ Admin requesting deletion of User: ${userId}`);//prints msg to vscode terminal

  const query = `DELETE FROM users WHERE user_id = ?`;

  pool.query(query, [userId], (err, result) => {//callback function after database finishes trying to delete user
    if (err) {
      console.error("❌ Delete User Error:", err.message);//log error
      return res.status(500).json({ success: false, message: err.message });//send 500 error with message
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });//no user deleted bcs user not found
    }

    res.json({ success: true, message: "User deleted successfully" });//send success msg
  });
});

const PORT = 5000;//define port 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));//open 5000 and listen for traffic, console.log runs only when server is live displayed on cmd