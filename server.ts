import express from 'express';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const distPath = path.join(process.cwd(), 'food-log', 'docs');

  // Make sure dist exists to avoid express static errors
  if (!fs.existsSync(distPath)) {
    console.warn('food-log/docs folder not found. Please run `npm run build` first.');
  }

  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Site not generated yet. Run `npm run build`.');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Preview server running on port ${PORT}`);
  });
}

startServer();
