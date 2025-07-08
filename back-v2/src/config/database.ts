import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL || './database.sqlite',
  logging: false, // Mettre à true pour voir les requêtes SQL
});

export default sequelize;
// Ou alternativement :
// export { sequelize };