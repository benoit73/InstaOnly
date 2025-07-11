import { Image, Account, User } from '../models';
import { StableDiffusionService } from './stableDiffusionService';
import { FileService } from './fileService';
import { Op } from 'sequelize';
import fs from 'fs';

export interface ImageCreateData {
  filename: string;
  filePath: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  userId: number;
  accountId?: number;
  isDeleted?: boolean;
}

export interface ImageUpdateData {
  filename?: string;
  prompt?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  isDeleted?: boolean;
  description?: string;
}

export interface GenerateImageData {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  denoising_strength?: number;
  cfg_scale?: number;
  sampler_index?: number;
  accountId: number;
  baseImageId?: number;
  description?: string;
  isStory?: boolean;
  type?: string;
  init_images_id?: number;
  seed?: number;
}

export class ImageService {
  private stableDiffusionService: StableDiffusionService;

  constructor() {
    this.stableDiffusionService = new StableDiffusionService();
  }

  // Générer une image
  async createImage(data: GenerateImageData & { userId: number }): Promise<any> {
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        denoising_strength = 0.75,
        accountId,
        type = '',
        init_images_id,
        seed,
        userId,
      } = data;

      if (!prompt) throw new Error('Prompt is required');
      if (!accountId) throw new Error('accountId is required');

      // Vérifier que le compte appartient bien à l'utilisateur
      const account = await Account.findOne({
        where: { id: accountId, userId },
        include: [{
          model: Image,
          as: 'mainImage',
          attributes: ['id', 'filename', 'filePath', 'seed', 'prompt', 'width', 'height']
        }]
      });
      if (!account) throw new Error('Account not found or does not belong to user');

      let result: any;
      if (type === "img2img") {
        console.log('img2img');
        if (!account.mainImage) throw new Error('No main image found for this account. Please generate a main image first.');
        let imageForImg2Img: any;
        if (init_images_id) {
          imageForImg2Img = await this.getImageById(init_images_id, userId);
        } else {
          imageForImg2Img = account.mainImage;
        }
        const imageBuffer = fs.readFileSync(imageForImg2Img.filePath);
        const base64Image = imageBuffer.toString('base64');
        result = await this.stableDiffusionService.img2img({
          prompt,
          negative_prompt,
          width,
          height,
          steps,
          denoising_strength,
          init_images: [base64Image],
          seed: account.mainImage.seed,
        });
      } else {
        console.log('txt2img');
        result = await this.stableDiffusionService.txt2img({
          prompt,
          negative_prompt,
          width,
          height,
          steps,
        });
      }

      let generatedSeed: number | undefined;
      try {
        const info = JSON.parse(result.info);
        generatedSeed = info.seed;
      } catch (error) {}

      const filename = `image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0],
        userId,
        accountId,
        filename
      );

      const image = await Image.create({
        filename,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        seed: generatedSeed,
        userId,
        accountId,
        isDeleted: false
      });

      return {
        ...this.formatImageResponse(image),
        stableDiffusionInfo: {
          parameters: result.parameters,
          info: result.info
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer toutes les images pour un utilisateur donné
  async getImages(userId: number): Promise<any[]> {
    try {
      const images = await Image.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      return images.map((img: any) => this.formatImageResponse(img));
    } catch (error) {
      throw new Error(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer une image par ID (et vérifier l'appartenance)
  async getImageById(id: number, userId: number): Promise<any> {
    try {
      const image = await Image.findOne({
        where: { id, userId },
        include: [
          {
            model: Account,
            as: 'account',
            attributes: ['id', 'name'],
            include: [
              {
                model: Image,
                as: 'mainImage',
                attributes: ['id', 'filename']
              }
            ]
          }
        ],
      });
      if (!image) throw new Error('Image not found or does not belong to user');
      return this.formatImageResponse(image);
    } catch (error) {
      throw new Error(`Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer les images par compte (et vérifier l'appartenance)
  async getImagesByAccount(accountId: number, userId: number, filters?: { status?: string; includeDeleted?: boolean }): Promise<any[]> {
    try {
      const whereClause: any = { accountId, userId };
      if (filters?.status) whereClause.status = filters.status;
      if (!filters?.includeDeleted) whereClause.isDeleted = false;

      const images = await Image.findAll({
        where: whereClause,
        include: [
          {
            model: Account,
            as: 'account',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return images.map((img: any) => this.formatImageResponse(img));
    } catch (error) {
      throw new Error(`Failed to fetch images by account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mettre à jour une image (et vérifier l'appartenance)
  async updateImage(id: number, userId: number, updateData: ImageUpdateData): Promise<any> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) throw new Error('Image not found or does not belong to user');
      await image.update(updateData);
      return this.formatImageResponse(image);
    } catch (error) {
      throw new Error(`Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Supprimer une image (hard delete, vérifier l'appartenance)
  async deleteImage(id: number, userId: number): Promise<void> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) throw new Error('Image not found or does not belong to user');
      await image.destroy();
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Marquer une image comme supprimée (soft delete, vérifier l'appartenance)
  async markAsDeleted(id: number, userId: number): Promise<any> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) throw new Error('Image not found or does not belong to user');
      await image.update({ isDeleted: true });
      return {
        id: image.id,
        isDeleted: image.isDeleted,
        filename: image.filename
      };
    } catch (error) {
      throw new Error(`Failed to mark image as deleted: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Marquer une image comme sauvegardée (soft delete, vérifier l'appartenance)
  async markAsSaved(id: number, userId: number): Promise<any> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) throw new Error('Image not found or does not belong to user');
      await image.update({ isDeleted: false });
      return {
        id: image.id,
        isDeleted: image.isDeleted,
        filename: image.filename
      };
    } catch (error) {
      throw new Error(`Failed to mark image as saved: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Vérifier si un fichier image existe (et appartient à l'utilisateur)
  async checkImageFileExists(id: number, userId: number): Promise<boolean> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) return false;
      return fs.existsSync(image.filePath);
    } catch (error) {
      return false;
    }
  }

  // Obtenir le chemin du fichier image (et vérifier l'appartenance)
  async getImageFilePath(id: number, userId: number): Promise<string> {
    try {
      const image = await Image.findOne({ where: { id, userId } });
      if (!image) throw new Error('Image not found or does not belong to user');
      if (!fs.existsSync(image.filePath)) throw new Error('Image file not found');
      return image.filePath;
    } catch (error) {
      throw new Error(`Failed to get image file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Obtenir les informations d'une image (et vérifier l'appartenance)
  async getImageInfo(id: number, userId: number): Promise<any> {
    try {
      const image = await Image.findOne({
        where: { id, userId },
        include: [
          {
            model: Account,
            as: 'account',
            attributes: ['id', 'name'],
            include: [
              {
                model: Image,
                as: 'mainImage',
                attributes: ['id', 'filename']
              }
            ]
          }
        ],
      });
      if (!image) throw new Error('Image not found or does not belong to user');
      return {
        id: image.id,
        filename: image.filename,
        prompt: image.prompt,
        negativePrompt: image.negativePrompt,
        width: image.width,
        height: image.height,
        steps: image.steps,
        account: image.account,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
        imageUrl: `/images/${image.id}/file`
      };
    } catch (error) {
      throw new Error(`Failed to fetch image info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Formater la réponse d'une image
  private formatImageResponse(image: any): any {
    return {
      id: image.id,
      filename: image.filename,
      filePath: image.filePath,
      prompt: image.prompt,
      negativePrompt: image.negativePrompt,
      width: image.width,
      height: image.height,
      steps: image.steps,
      seed: image.seed,
      userId: image.userId,
      accountId: image.accountId,
      account: image.account,
      isDeleted: image.isDeleted,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      imageUrl: `/images/${image.id}/file`,
      fileExists: fs.existsSync(image.filePath)
    };
  }
}