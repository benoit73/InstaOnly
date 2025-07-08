import { DataTypes, Model, Optional, Association, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';

interface AccountAttributes {
  id: number;
  name: string;
  description?: string;
  userId: number;
  mainImageId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id'> {}

class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public userId!: number;
  public mainImageId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public mainImage?: any;
  public images?: any[];
  
  // Méthodes d'association
  public getImages!: HasManyGetAssociationsMixin<any>;

  // Déclarations des associations
  public static associations: {
    mainImage: Association<Account, any>;
    images: Association<Account, any>;
  };
}

Account.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // ✅
            key: 'id',
        },
        },
        mainImageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'images', // ✅
            key: 'id',
        },
        },

  },
  {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
  }
);

export default Account;