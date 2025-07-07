import { Response, Request } from 'express';
import path from 'path';
import { Image, Account } from '../models';
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
          prompt: image.prompt,
          negativePrompt: image.negativePrompt,
          width: image.width,
          height: image.height,
          steps: image.steps,
          createdAt: image.createdAt,
          imageUrl: `/api/images/${image.id}`,
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
            include: [
              {
                model: Image,
                as: 'mainImage',
                attributes: ['id', 'filename']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: images.map(img => ({
          id: img.id,
          filename: img.filename,
          originalName: img.originalName,
          prompt: img.prompt,
          negativePrompt: img.negativePrompt,
          width: img.width,
          height: img.height,
          steps: img.steps,
          account: img.account,
          createdAt: img.createdAt,
          imageUrl: `/api/images/${img.id}` // URL pour accéder à l'image
        }))
      });

    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
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
}