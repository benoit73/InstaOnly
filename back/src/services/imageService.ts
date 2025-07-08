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
}

export class ImageService {
  private stableDiffusionService: StableDiffusionService;

  constructor() {
    this.stableDiffusionService = new StableDiffusionService();
  }

  // Générer une image
  async createImage(data: GenerateImageData): Promise<any> {
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
      } = data;

      if (!prompt) {
        throw new Error('Prompt is required');
      }

      if (!accountId) {
        throw new Error('accountId is required');
      }

      // Vérifier que le compte existe et récupérer l'image principale avec la seed
      const account = await Account.findOne({
        where: { id: accountId },
        include: [
          {
            model: Image,
            as: 'mainImage',
            attributes: ['id', 'filename', 'filePath', 'seed', 'prompt', 'width', 'height']
          }
        ]
      });

      if (!account) {
        throw new Error('Account not found');
      }

      if (!account.mainImage) {
        throw new Error('No main image found for this account. Please generate a main image first.');
      }

      console.log(`Starting image generation with prompt: "${prompt}"`);
      console.log(`Using base image seed: ${account.mainImage.seed}`);

      let result: any;

      if (type === "img2img") {
        // Récupérer l'image pour img2img
        let imageForImg2Img: any;
        
        if (init_images_id) {
          imageForImg2Img = await this.getImageById(init_images_id);
        } else {
          imageForImg2Img = account.mainImage;
        }

        // Mode img2img avec la seed de l'image de base
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
        // Mode txt2img
        result = await this.stableDiffusionService.txt2img({
          prompt,
          negative_prompt,
          width,
          height,
          steps,
        });
      }

      console.log('Image generation completed');

      // Extraire la seed de la réponse
      let generatedSeed: number | undefined;
      try {
        const info = JSON.parse(result.info);
        generatedSeed = info.seed;
        console.log('Generated with seed:', generatedSeed);
      } catch (error) {
        console.warn('Could not extract seed from response:', error);
        generatedSeed = account.mainImage.seed; // Fallback sur la seed d'origine
      }

      // Sauvegarder l'image générée
      const filename = `image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0], // Première image générée
        1, // userId par défaut
        accountId,
        filename
      );

      // Enregistrer en base de données
      const image = await Image.create({
        filename,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        seed: generatedSeed, // Seed utilisée pour la génération
        userId: 1, // userId par défaut
        accountId: accountId,
        isDeleted: false
      });

      return {
        ...this.formatImageResponse(image),
        baseImageSeed: account.mainImage.seed,
        baseImageId: account.mainImage.id,
        stableDiffusionInfo: {
          parameters: result.parameters,
          info: result.info
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer toutes les images
  async getImages(filters?: { accountId?: number; status?: string; includeDeleted?: boolean }): Promise<any[]> {
    try {
      const whereClause: any = {};
      
      if (filters?.accountId) {
        whereClause.accountId = filters.accountId;
      }
      
      if (filters?.status) {
        whereClause.status = filters.status;
      }

      // Exclure les images supprimées par défaut
      if (!filters?.includeDeleted) {
        whereClause.isDeleted = false;
      }

      const images = await Image.findAll({
        where: whereClause,
        include: [
          {
            model: Account,
            as: 'account',
            attributes: ['id', 'name'],
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      return images.map((img: any) => this.formatImageResponse(img));
    } catch (error) {
      throw new Error(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer une image par ID
  async getImageById(id: number): Promise<any> {
    try {
      const image = await Image.findOne({
        where: { id },
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

      if (!image) {
        throw new Error('Image not found');
      }

      return this.formatImageResponse(image);
    } catch (error) {
      throw new Error(`Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Récupérer les images par compte
  async getImagesByAccount(accountId: number, filters?: { status?: string; includeDeleted?: boolean }): Promise<any[]> {
    try {
      const whereClause: any = { accountId };
      
      if (filters?.status) {
        whereClause.status = filters.status;
      }

      // Exclure les images supprimées par défaut
      if (!filters?.includeDeleted) {
        whereClause.isDeleted = false;
      }
      
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

  // Mettre à jour une image
  async updateImage(id: number, updateData: ImageUpdateData): Promise<any> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        throw new Error('Image not found');
      }
      
      await image.update(updateData);
      return this.formatImageResponse(image);
    } catch (error) {
      throw new Error(`Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Supprimer une image (hard delete)
  async deleteImage(id: number): Promise<void> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        throw new Error('Image not found');
      }
      
      await image.destroy();
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Marquer une image comme supprimée (soft delete)
  async markAsDeleted(id: number): Promise<any> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        throw new Error('Image not found');
      }
      
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

  // Restaurer une image supprimée
  async restoreImage(id: number): Promise<any> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        throw new Error('Image not found');
      }
      
      await image.update({ isDeleted: false });
      return {
        id: image.id,
        isDeleted: image.isDeleted,
        filename: image.filename
      };
    } catch (error) {
      throw new Error(`Failed to restore image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Vérifier si un fichier image existe
  async checkImageFileExists(id: number): Promise<boolean> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        return false;
      }
      return fs.existsSync(image.filePath);
    } catch (error) {
      return false;
    }
  }

  // Obtenir le chemin du fichier image
  async getImageFilePath(id: number): Promise<string> {
    try {
      const image = await Image.findByPk(id);
      if (!image) {
        throw new Error('Image not found');
      }
      
      if (!fs.existsSync(image.filePath)) {
        throw new Error('Image file not found');
      }
      
      return image.filePath;
    } catch (error) {
      throw new Error(`Failed to get image file path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Obtenir les informations d'une image
  async getImageInfo(id: number): Promise<any> {
    try {
      const image = await Image.findOne({
        where: { id },
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

      if (!image) {
        throw new Error('Image not found');
      }

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