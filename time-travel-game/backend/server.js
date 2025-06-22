const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Import auth routes
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
