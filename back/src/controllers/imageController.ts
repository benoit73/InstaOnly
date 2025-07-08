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

  // Fonction helper pour obtenir la seed de l'image de base du compte
  private async getAccountBaseSeed(accountId: number): Promise<{ account: any, baseSeed: number | undefined }> {
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

    return {
      account,
      baseSeed: account.mainImage.seed
    };
  }

  // Méthode pour générer une image principale (txt2img)
  async generateTxt2img(req: Request, res: Response) {
    console.log('generateTxt2img starting..');
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        accountId,
        type = 'base' // Par défaut 'base', peut être 'normal'
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      let account;
      let baseSeed: number | undefined;
      let baseImageId: number | undefined;

      if (type === 'normal') {
        // Pour le type 'normal', récupérer la seed de l'image de base
        try {
          const result = await this.getAccountBaseSeed(accountId);
          account = result.account;
          baseSeed = result.baseSeed;
          baseImageId = account.mainImage.id;
          console.log(`Using base image seed: ${baseSeed} for normal generation`);
        } catch (error: any) {
          return res.status(400).json({ error: error.message });
        }
      } else {
        // Pour le type 'base', vérifier que le compte existe seulement
        account = await Account.findByPk(accountId);
        if (!account) {
          return res.status(404).json({ error: 'Account not found' });
        }
      }

      console.log(`Starting ${type} image generation with prompt: "${prompt}"`);

      // Utiliser txt2img pour générer l'image avec ou sans seed
      const result = await this.stableDiffusionService.txt2img({
        prompt,
        negative_prompt,
        width,
        height,
        steps,
        seed: baseSeed // Undefined pour 'base', seed de l'image de base pour 'normal'
      });

      console.log(`${type} image generation completed`);

      // Extraire la seed de la réponse
      let seed: number | undefined;
      try {
        const info = JSON.parse(result.info);
        seed = info.seed;
        console.log('Extracted seed:', seed);
      } catch (error) {
        console.warn('Could not extract seed from response:', error);
        seed = baseSeed; // Fallback sur la seed de base si disponible
      }

      // Sauvegarder l'image générée
      const filename = `${type}_image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0], // Première image générée
        1, // userId par défaut
        accountId,
        filename
      );

      // Enregistrer en base de données avec la seed
      const image = await Image.create({
        filename,
        originalName: `${type}_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        seed, // Seed utilisée pour la génération
        userId: 1, // userId par défaut
        accountId: accountId,
      });

      // Préparer la réponse
      const responseData: any = {
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
        createdAt: image.createdAt,
        imageUrl: `/api/images/${image.id}/file`,
        // Informations supplémentaires de Stable Diffusion
        stableDiffusionInfo: {
          parameters: result.parameters,
          info: result.info
        }
      };

      // Ajouter des informations supplémentaires pour le type 'normal'
      if (type === 'normal' && baseImageId && baseSeed) {
        responseData.baseImageId = baseImageId;
        responseData.baseImageSeed = baseSeed;
      }

      res.status(201).json({
        success: true,
        message: `${type === 'normal' ? 'Normal' : 'Main'} image generated successfully`,
        data: responseData
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

  // Méthode pour générer une image basée sur l'image principale du compte (img2img)
  async generateImg2img(req: Request, res: Response) {
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        denoising_strength = 0.75,
        accountId
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      // Utiliser la fonction helper pour récupérer l'image de base et sa seed
      let account, baseSeed;
      try {
        const result = await this.getAccountBaseSeed(accountId);
        account = result.account;
        baseSeed = result.baseSeed;
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

      console.log(`Starting image generation with img2img, prompt: "${prompt}"`);
      console.log(`Using base image seed: ${baseSeed}`);

      // Convertir l'image principale en base64
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(account.mainImage.filePath);
      const base64Image = imageBuffer.toString('base64');

      // Utiliser img2img pour générer l'image avec la seed de l'image de base
      const result = await this.stableDiffusionService.img2img({
        prompt,
        negative_prompt,
        width,
        height,
        steps,
        denoising_strength,
        init_images: [base64Image],
        seed: baseSeed // UTILISER LA SEED DE L'IMAGE DE BASE
      });

      console.log('Image generation completed');

      // Extraire la seed de la réponse
      let seed: number | undefined;
      try {
        const info = JSON.parse(result.info);
        seed = info.seed;
        console.log('Generated with seed:', seed);
      } catch (error) {
        console.warn('Could not extract seed from response:', error);
        seed = baseSeed; // Fallback sur la seed d'origine
      }

      // Sauvegarder l'image générée
      const filename = `image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0], // Première image générée
        1, // userId par défaut
        accountId,
        filename
      );

      // Enregistrer en base de données avec la seed
      const image = await Image.create({
        filename,
        originalName: `generated_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        seed, // Seed utilisée pour la génération
        userId: 1, // userId par défaut
        accountId: accountId,
      });

      res.status(201).json({
        success: true,
        message: 'Image generated successfully from main image',
        data: {
          id: image.id,
          filename: image.filename,
          filePath: image.filePath,
          prompt: image.prompt,
          negativePrompt: image.negativePrompt,
          width: image.width,
          height: image.height,
          steps: image.steps,
          seed: image.seed,
          denoising_strength: denoising_strength,
          userId: image.userId,
          accountId: image.accountId,
          createdAt: image.createdAt,
          imageUrl: `/api/images/${image.id}/file`,
          baseImageId: account.mainImage.id,
          baseImageSeed: baseSeed, // AJOUTER LA SEED DE BASE
          // Informations supplémentaires de Stable Diffusion
          stableDiffusionInfo: {
            parameters: result.parameters,
            info: result.info
          }
        }
      });

    } catch (error: any) {
      console.error('Error generating image from image:', error);
      
      if (error.name === 'AbortError') {
        res.status(408).json({ 
          success: false,
          error: 'Request timeout',
          message: 'Image generation took too long and was cancelled'
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to generate image from image',
          message: error.message || 'Unknown error occurred'
        });
      }
    }
  }

  // Ajouter une nouvelle méthode pour la génération normale
  async generateNormal(req: Request, res: Response) {
    console.log('generateNormal starting..');
    try {
      const {
        prompt,
        negative_prompt,
        width = 512,
        height = 512,
        steps = 20,
        denoising_strength = 0.75,
        accountId,
        type
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
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
        return res.status(404).json({ error: 'Account not found' });
      }

      if (!account.mainImage) {
        return res.status(400).json({ error: 'No main image found for this account. Please generate a main image first.' });
      }

      console.log(`Starting normal image generation with prompt: "${prompt}"`);
      console.log(`Using base image seed: ${account.mainImage.seed}`);

      let result;

      if (type === 'normal') {
        // Mode img2img avec la seed de l'image de base
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(account.mainImage.filePath);
        const base64Image = imageBuffer.toString('base64');

        result = await this.stableDiffusionService.img2img({
          prompt,
          negative_prompt,
          width,
          height,
          steps,
          denoising_strength,
          init_images: [base64Image],
          seed: account.mainImage.seed // UTILISER LA SEED DE L'IMAGE DE BASE
        });
      } else {
        // Mode txt2img avec la seed de l'image de base
        result = await this.stableDiffusionService.txt2img({
          prompt,
          negative_prompt,
          width,
          height,
          steps,
          seed: account.mainImage.seed // UTILISER LA SEED DE L'IMAGE DE BASE
        });
      }

      console.log('Normal image generation completed');

      // Extraire la seed de la réponse (devrait être la même que celle passée)
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
      const filename = `normal_image_${Date.now()}.png`;
      const filePath = await FileService.saveImageFromBase64(
        result.images[0], // Première image générée
        1, // userId par défaut
        accountId,
        filename
      );

      // Enregistrer en base de données
      const image = await Image.create({
        filename,
        originalName: `normal_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        filePath,
        prompt,
        negativePrompt: negative_prompt,
        width,
        height,
        steps,
        seed: generatedSeed, // Seed utilisée pour la génération
        userId: 1, // userId par défaut
        accountId: accountId,
      });

      res.status(201).json({
        success: true,
        message: 'Normal image generated successfully',
        data: {
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
          createdAt: image.createdAt,
          imageUrl: `/api/images/${image.id}/file`,
          baseImageSeed: account.mainImage.seed, // Seed de l'image de base utilisée
          baseImageId: account.mainImage.id,
          // Informations supplémentaires de Stable Diffusion
          stableDiffusionInfo: {
            parameters: result.parameters,
            info: result.info
          }
        }
      });

    } catch (error: any) {
      console.error('Error generating normal image:', error);
      
      if (error.name === 'AbortError') {
        res.status(408).json({ 
          success: false,
          error: 'Request timeout',
          message: 'Normal image generation took too long and was cancelled'
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to generate normal image',
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
          seed: img.seed,
          accountId: img.accountId,
          account: img.account,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          // URL pour récupérer le fichier image via sendFile
          imageUrl: `/api/images/${img.id}/file`,
          // URL directe pour les uploads (si accessible statiquement)
          directUrl: `/uploads/${img.filePath.replace('uploads/', '')}`,
          // Vérifier si le fichier existe physiquement
          fileExists: require('fs').existsSync(img.filePath)
        })),
        count: images.length
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

      // Mapper les images avec les URLs correctes pour récupérer les fichiers
      const mappedImages = images.map((img: any) => ({
        id: img.id,
        filename: img.filename,
        originalName: img.originalName,
        filePath: img.filePath,
        prompt: img.prompt,
        negativePrompt: img.negativePrompt,
        width: img.width,
        height: img.height,
        steps: img.steps,
        seed: img.seed,
        userId: img.userId,
        accountId: img.accountId,
        account: img.account,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
        // URL pour récupérer le fichier image via sendFile
        imageUrl: `/api/images/${img.id}/file`,
        // URL directe pour les uploads (si accessible statiquement)
        directUrl: `/uploads/${img.filePath.replace('uploads/', '')}`,
        // Vérifier si le fichier existe physiquement
        fileExists: require('fs').existsSync(img.filePath)
      }));

      res.json({
        success: true,
        data: mappedImages,
        count: mappedImages.length
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
        seed: originalImage.seed, // COPIER LA SEED AUSSI
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
          seed: duplicatedImage.seed, // INCLURE LA SEED DANS LA RÉPONSE
          userId: duplicatedImage.userId,
          accountId: duplicatedImage.accountId,
          createdAt: duplicatedImage.createdAt,
          imageUrl: `/api/images/${duplicatedImage.id}/file`
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


  }