import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import scanRoutes from './routes/scan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React app
app.use(express.static(join(__dirname, '../dist')));

// API Routes
app.use('/api/scan', scanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔧 API available at http://localhost:${PORT}/api`);
});