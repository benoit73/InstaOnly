import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sequelize from './config/database';
import { User, Account, Image } from './models';
import imageRoutes from './routes/imageRoutes';
import userRoutes from './routes/userRoutes';
import accountRoutes from './routes/accountRoutes';
import { seedDatabase } from './utils/seedData'; // ← Ajout de l'import

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Augmenter le timeout pour les requêtes longues (6 minutes)
app.use((req, res, next) => {
  res.setTimeout(360000, () => {
    res.status(408).json({
      success: false,
      error: 'Request timeout',
      message: 'The request took too long to process'
    });
  });
  next();
});

// Routes
app.use('/api', imageRoutes);
app.use('/api', userRoutes);
app.use('/api', accountRoutes);

// Route de test pour vérifier que l'API fonctionne
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    stable_diffusion_url: process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:7860'
  });
});

// Initialiser la base de données et démarrer le serveur
async function startServer() {
  try {
    // Synchroniser la base de données
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // CHANGEZ force: false en force: true temporairement
    await sequelize.sync({ force: true }); // ⚠️ ATTENTION: Cela supprime toutes les données
    console.log('Database synchronized successfully.');
    
    // Peupler la base avec des données de test
    await seedDatabase();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Stable Diffusion API URL: ${process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:7860'}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();