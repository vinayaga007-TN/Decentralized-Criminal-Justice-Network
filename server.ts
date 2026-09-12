import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';
import { firRouter } from './server/routes/fir';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // FIR PDFs/scans are sent as base64 JSON in this prototype.
  // Keep the limit large enough for real scanned FIR documents.
  app.use(express.json({ limit: '25mb' }));

  // Mount API endpoints
  app.use('/api', apiRouter);
  app.use('/api/fir', firRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'DCJMN Sovereign Gateway', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DCJMN Sovereign Justice Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
