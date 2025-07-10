import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement avec priorité explicite d
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.local'),
  override: true // Force l'écrasement des variables existantes
});

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || '/cloudsql/notional-cirrus-465211-g3:europe-west9:bdd-instaonly-manager',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'instaonly',
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Logs SQL en développement
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 10000,
    idle: 10000
  }
});

export default sequelize;