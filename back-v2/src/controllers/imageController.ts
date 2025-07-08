import { Response, Request } from 'express';
import path from 'path';
import { Image, Account, User } from '../models';
import { StableDiffusionService } from '../services/stableDiffusionService';
import { FileService } from '../services/fileService';

export class ImageController {
  private stableDiffusionService: StableDiffusionService;

  constructor() {
    this.stableDiffusionService = new StableDiffusionService();
  }

  // Méthode pour générer une image principale (txt2img)
  async generateMainImage(req: Request, res: Response) {
    console.log('generateMainImage starting..');
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        accountId
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      // Vérifier que le compte existe
      const account = await Account.findByPk(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      console.log(`Starting main image generation with prompt: "${prompt}"`);

      // Utiliser txt2img pour générer l'image principale
      const result = await this.stableDiffusionService.txt2img({
        prompt,
        negative_prompt,
        width,
        height,
        steps
      });

      console.log('Main image generation completed');

      // Sauvegarder l'image générée
      const filename = `main_image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0], // Première image générée
        1, // userId par défaut
        accountId,
        filename
      );

      // Enregistrer en base de données
      const image = await Image.create({
        filename,
        originalName: `main_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        userId: 1, // userId par défaut
        accountId: accountId,
      });

      // Définir cette image comme image principale du compte
      await account.update({ mainImageId: image.id });

      res.status(201).json({
        success: true,
        message: 'Main image generated and set successfully',
        data: {
          id: image.id,
          filename: image.filename,
          filePath: image.filePath, // Ajout du filePath
          prompt: image.prompt,
          negativePrompt: image.negativePrompt,
          width: image.width,
          height: image.height,
          steps: image.steps,
          userId: image.userId,
          accountId: image.accountId,
          createdAt: image.createdAt,
          imageUrl: `/api/images/${image.id}/file`, // URL pour accéder à l'image
          isMainImage: true,
          // Informations supplémentaires de Stable Diffusion
          stableDiffusionInfo: {
            parameters: result.parameters,
            info: result.info
          }
        }
      });

    } catch (error: any) {
      console.error('Error generating main image:', error);
      
      if (error.name === 'AbortError') {
        res.status(408).json({ 
          success: false,
          error: 'Request timeout',
          message: 'Main image generation took too long and was cancelled'
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to generate main image',
          message: error.message || 'Unknown error occurred'
        });
      }
    }
  }

  // Méthode pour générer une image basée sur une image existante (img2img)
  async generateImage(req: Request, res: Response) {
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        denoising_strength = 0.75,
        init_images,
        accountId,
        useMainImage = false
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      let baseImages: string[] = [];

      // Si on utilise l'image principale du compte
      if (useMainImage && accountId) {
        const account = await Account.findOne({
          where: { id: accountId },
          include: [
            {
              model: Image,
              as: 'mainImage',
              attributes: ['id', 'filename', 'filePath']
            }
          ]
        });

        if (!account) {
          return res.status(404).json({ error: 'Account not found' });
        }

        if (!account.mainImage) {
          return res.status(400).json({ error: 'No main image found for this account. Please generate a main image first.' });
        }

        // Convertir l'image principale en base64
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(account.mainImage.filePath);
        const base64Image = imageBuffer.toString('base64');
        baseImages = [base64Image];
      } else if (init_images && init_images.length > 0) {
        // Utiliser les images fournies dans la requête
        baseImages = init_images;
      } else {
        return res.status(400).json({ error: 'Either init_images or useMainImage with accountId must be provided for img2img' });
      }

      console.log(`Starting image generation with img2img, prompt: "${prompt}"`);

      // Utiliser img2img pour générer l'image
      const result = await this.stableDiffusionService.img2img({
        prompt,
        negative_prompt,
        width,
        height,
        steps,
        denoising_strength,
        init_images: baseImages
      });

      console.log('Image generation completed');

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
        originalName: `generated_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        userId: 1, // userId par défaut
        accountId: accountId || null,
      });

      res.status(201).json({
        success: true,
        message: 'Image generated successfully',
        data: {
          id: image.id,
          filename: image.filename,
          prompt: image.prompt,
          negativePrompt: image.negativePrompt,
          width: image.width,
          height: image.height,
          steps: image.steps,
          denoising_strength: denoising_strength,
          createdAt: image.createdAt,
          imageUrl: `/api/images/${image.id}`,
          // Informations supplémentaires de Stable Diffusion
          stableDiffusionInfo: {
            parameters: result.parameters,
            info: result.info
          }
        }
      });

    } catch (error: any) {
      console.error('Error generating image:', error);
      
      if (error.name === 'AbortError') {
        res.status(408).json({ 
          success: false,
          error: 'Request timeout',
          message: 'Image generation took too long and was cancelled'
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to generate image',
          message: error.message || 'Unknown error occurred'
        });
      }
    }
  }

  async getImages(req: Request, res: Response) {
    try {
      const { accountId } = req.query;

      const whereClause: any = {};
      if (accountId) {
        whereClause.accountId = accountId;
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

      res.json({
        success: true,
        data: images.map((img: any) => ({
          id: img.id,
          filename: img.filename,
          originalName: img.originalName,
          filePath: img.filePath,
          prompt: img.prompt,
          negativePrompt: img.negativePrompt,
          width: img.width,
          height: img.height,
          steps: img.steps,
          accountId: img.accountId,
          account: img.account,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          // URLs pour accéder aux images
          imageUrl: `/api/images/${img.id}/file`,
          directUrl: `/uploads/${img.filePath.replace('uploads/', '')}`,
        }))
      });

    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch images' 
      });
    }
  }

  async getImageById(req: Request, res: Response) {
    try {
      const { id } = req.params;

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
        return res.status(404).json({ error: 'Image not found' });
      }

      // Vérifier que le fichier existe
      if (!require('fs').existsSync(image.filePath)) {
        return res.status(404).json({ error: 'Image file not found' });
      }

      // Servir le fichier image
      res.sendFile(path.resolve(image.filePath));

    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  }

  async getImageInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;

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
        return res.status(404).json({ error: 'Image not found' });
      }

      res.json({
        success: true,
        data: {
          id: image.id,
          filename: image.filename,
          originalName: image.originalName,
          prompt: image.prompt,
          negativePrompt: image.negativePrompt,
          width: image.width,
          height: image.height,
          steps: image.steps,
          account: image.account,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
          imageUrl: `/api/images/${image.id}`
        }
      });

    } catch (error) {
      console.error('Error fetching image info:', error);
      res.status(500).json({ error: 'Failed to fetch image info' });
    }
  }

  // Récupérer les images par compte
  async getImagesByAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { status } = req.query;
      
      let whereClause: any = { accountId: parseInt(accountId) };
      
      if (status) {
        whereClause.status = status;
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

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error fetching images by account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch images',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mettre à jour une image
  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const image = await Image.findByPk(id);
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }
      
      await image.update(updateData);
      
      res.json({
        success: true,
        data: image
      });
    } catch (error) {
      console.error('Error updating image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Supprimer une image
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const image = await Image.findByPk(id);
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }
      
      await image.destroy();
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Dupliquer une image
  async duplicateImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const originalImage = await Image.findByPk(id);
      if (!originalImage) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }
      
      // Créer une copie physique du fichier (optionnel)
      const fs = require('fs');
      const path = require('path');
      
      const originalPath = originalImage.filePath;
      const fileExtension = path.extname(originalPath);
      const newFilename = `copy_${Date.now()}_${originalImage.filename}`;
      const newFilePath = originalPath.replace(originalImage.filename, newFilename);
      
      // Copier le fichier physique
      try {
        fs.copyFileSync(originalPath, newFilePath);
      } catch (fileError) {
        console.warn('Could not copy physical file, using same path:', fileError);
        // Utiliser le même chemin si la copie échoue
      }
      
      const duplicatedImage = await Image.create({
        filename: newFilename,
        originalName: `copy_${originalImage.originalName || originalImage.filename}`,
        filePath: fs.existsSync(newFilePath) ? newFilePath : originalImage.filePath,
        prompt: originalImage.prompt,
        negativePrompt: originalImage.negativePrompt,
        width: originalImage.width,
        height: originalImage.height,
        steps: originalImage.steps,
        userId: originalImage.userId,
        accountId: originalImage.accountId
      });
      
      res.json({
        success: true,
        data: {
          id: duplicatedImage.id,
          filename: duplicatedImage.filename,
          originalName: duplicatedImage.originalName,
          filePath: duplicatedImage.filePath,
          prompt: duplicatedImage.prompt,
          negativePrompt: duplicatedImage.negativePrompt,
          width: duplicatedImage.width,
          height: duplicatedImage.height,
          steps: duplicatedImage.steps,
          userId: duplicatedImage.userId,
          accountId: duplicatedImage.accountId,
          createdAt: duplicatedImage.createdAt,
          imageUrl: `/api/images/${duplicatedImage.id}`
        }
      });
    } catch (error) {
      console.error('Error duplicating image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to duplicate image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Créer des variantes
  async createVariants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { count = 3 } = req.body;
      
      // À implémenter avec l'API Stable Diffusion
      res.status(501).json({
        success: false,
        error: 'Variants creation not implemented yet'
      });
    } catch (error) {
      console.error('Error creating variants:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create variants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Publier une photo (placeholder)
  async publishPhoto(req: Request, res: Response): Promise<void> {
    res.status(501).json({
      success: false,
      error: 'Instagram publishing not implemented yet'
    });
  }

  // Programmer une photo (placeholder)
  async schedulePhoto(req: Request, res: Response): Promise<void> {
    res.status(501).json({
      success: false,
      error: 'Photo scheduling not implemented yet'
    });
  }

  // Statistiques d'une photo (placeholder)
  async getImageStats(req: Request, res: Response): Promise<void> {
    res.status(501).json({
      success: false,
      error: 'Image stats not implemented yet'
    });
  }
}