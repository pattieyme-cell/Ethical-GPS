const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = process.env.VITE_GEMINI_API_KEY || 'development_secret_key'; // Using the api key just as a random secret fallback if none exists

const db = new sqlite3.Database('./ethical_gps.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database.');
});

// Initialize Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      age INTEGER,
      status TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      input TEXT,
      analysis TEXT,
      timestamp INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      feedback_text TEXT,
      timestamp INTEGER
    )
  `);
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, age, status } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, age, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, age, status],
      function (err) {
        if (err) return res.status(400).json({ error: 'Email already exists' });
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: this.lastID, name, email, age, status } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, age: user.age, status: user.status } });
  });
});

// Data Routes
app.delete('/api/users/account', authenticateToken, (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM feedback WHERE user_id = ?', [req.user.id]);
    db.run('DELETE FROM decisions WHERE user_id = ?', [req.user.id]);
    db.run('DELETE FROM users WHERE id = ?', [req.user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete account' });
      res.json({ success: true });
    });
  });
});

app.put('/api/users/profile', authenticateToken, (req, res) => {
  const { name, age, status } = req.body;
  db.run('UPDATE users SET name = ?, age = ?, status = ? WHERE id = ?', [name, age, status, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update profile' });
    res.json({ success: true, name, age, status });
  });
});

app.delete('/api/decisions/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM decisions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete decision' });
    res.json({ success: true });
  });
});

app.post('/api/decisions', authenticateToken, (req, res) => {
  const { input, analysis } = req.body;
  const timestamp = Date.now();
  db.run(
    'INSERT INTO decisions (user_id, input, analysis, timestamp) VALUES (?, ?, ?, ?)',
    [req.user.id, input, JSON.stringify(analysis), timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save decision' });
      res.json({ id: this.lastID, user_id: req.user.id, input, analysis, timestamp });
    }
  );
});

app.get('/api/decisions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM decisions WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch decisions' });
    const decisions = rows.map(r => ({ ...r, analysis: JSON.parse(r.analysis) }));
    res.json(decisions);
  });
});

app.post('/api/feedback', authenticateToken, (req, res) => {
  const { feedback_text } = req.body;
  const timestamp = Date.now();
  db.run(
    'INSERT INTO feedback (user_id, feedback_text, timestamp) VALUES (?, ?, ?)',
    [req.user.id, feedback_text, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save feedback' });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => console.log('Backend running on http://localhost:' + PORT));
