import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ImageAttributes {
  id: number;
  filename: string;
  filePath: string;
  prompt: string;
  negativePrompt?: string;
  description?: string; // NOUVEAU CHAMP
  width: number;
  height: number;
  steps: number;
  seed?: number; // Sera stocké comme BIGINT
  userId: number;
  accountId: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'negativePrompt' | 'seed' | 'isDeleted'> {}

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
  public id!: number;
  public filename!: string;
  public filePath!: string;
  public prompt!: string;
  public negativePrompt?: string;
  public description?: string;
  public width!: number;
  public height!: number;
  public steps!: number;
  public seed?: number; // Sera stocké comme BIGINT
  public userId!: number;
  public accountId!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public account?: any;
  public user?: any;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    negativePrompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 512,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 512,
    },
    steps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    seed: {
      type: DataTypes.BIGINT, // CHANGÉ de INTEGER à BIGINT
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Image',
    tableName: 'images',
    timestamps: true,
  }
);

export default Image;