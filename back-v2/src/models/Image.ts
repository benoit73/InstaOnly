import { DataTypes, Model, Optional, Association } from 'sequelize';
import sequelize from '../config/database';

interface ImageAttributes {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  userId: number;
  accountId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id'> {}

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
  public id!: number;
  public filename!: string;
  public originalName!: string;
  public filePath!: string;
  public prompt!: string;
  public negativePrompt?: string;
  public width?: number;
  public height?: number;
  public steps?: number;
  public userId!: number;
  public accountId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public account?: any;
  public accountsUsingAsMain?: any[];

  // Déclarations des associations
  public static associations: {
    account: Association<Image, any>;
    accountsUsingAsMain: Association<Image, any>;
  };
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
    originalName: {
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
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    steps: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Image',
    tableName: 'images',
  }
);

export default Image;