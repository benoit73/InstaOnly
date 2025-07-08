import { DataTypes, Model, Optional } from 'sequelize';
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
  seed?: number;
  userId: number;
  accountId?: number;
  isDeleted?: boolean; // NOUVEAU CHAMP
  createdAt?: Date;
  updatedAt?: Date;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'negativePrompt' | 'width' | 'height' | 'steps' | 'seed' | 'accountId' | 'isDeleted'> {}

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
  public seed?: number;
  public userId!: number;
  public accountId?: number;
  public isDeleted?: boolean;
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
    seed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
        userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // ✅ nom réel de la table, en minuscule
            key: 'id',
        },
    },
    accountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: 'accounts', // ✅ pareil ici
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