const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leaseRoutes = require('./routes/lease');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lease', leaseRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'active', message: 'RentGuard Backend Engine Operational' });
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});