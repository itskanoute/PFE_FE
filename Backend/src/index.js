import './loadEnv.js';
import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection();
    console.log('Connexion MySQL établie');

    app.listen(PORT, () => {
      console.log(`API EduManage démarrée sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur:', error.message);
    process.exit(1);
  }
}

start();
