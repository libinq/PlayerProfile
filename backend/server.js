require('dotenv').config();
const express = require('express');
const cors = require('cors');
const athleteRoutes = require('./routes/athletes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/athletes', athleteRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
