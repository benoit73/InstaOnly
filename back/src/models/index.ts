import sequelize from '../config/database';
import User from './User';
import Account from './Account';
import Image from './Image';

// Définir les associations
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Image, { foreignKey: 'userId', as: 'images' });
Image.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Account.hasMany(Image, { foreignKey: 'accountId', as: 'images' });
Image.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

Account.belongsTo(Image, { foreignKey: 'mainImageId', as: 'mainImage' });

export { User, Account, Image, sequelize };
export default sequelize;