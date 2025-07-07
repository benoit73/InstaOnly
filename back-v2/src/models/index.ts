import User from './User';
import Account from './Account';
import Image from './Image';

// Relations existantes
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Image, { foreignKey: 'userId', as: 'images' });
Image.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Account.hasMany(Image, { foreignKey: 'accountId', as: 'images' });
Image.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Nouvelle relation pour mainImage
Account.belongsTo(Image, { foreignKey: 'mainImageId', as: 'mainImage' });
Image.hasMany(Account, { foreignKey: 'mainImageId', as: 'accountsUsingAsMain' });

export { User, Account, Image };