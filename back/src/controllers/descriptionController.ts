import { Request, Response } from 'express';
import { LlavaService } from '../services/llavaService';
import { ImageService } from '../services/imageService';
import fs from 'fs';

export class DescriptionController {
  private llavaService: LlavaService;
  private imageService: ImageService;

  constructor() {
    this.llavaService = new LlavaService();
    this.imageService = new ImageService();
  }

  // Générer une description pour une image
  async generateDescription(req: Request, res: Response): Promise<void> {
    try {
      const { imageId, prompt } = req.query;

      if (!imageId) {
        res.status(400).json({
          success: false,
          error: 'imageId is required'
        });
        return;
      }

      const id = parseInt(imageId as string);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'imageId must be a valid number'
        });
        return;
      }

      // Récupérer l'image
      const image = await this.imageService.getImageById(id);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(image.filePath)) {
        res.status(404).json({
          success: false,
          error: 'Image file not found'
        });
        return;
      }

      // Lire le fichier image et le convertir en base64
      const imageBuffer = fs.readFileSync(image.filePath);
      const base64Image = imageBuffer.toString('base64');

      // Générer la description avec LLaVA
      const llavaResponse = await this.llavaService.generateDescription({
        image: base64Image,
        prompt: prompt as string || undefined // Utilise le prompt par défaut si non fourni
      });

      res.json({
        success: true,
        data: {
          imageId: id,
          description: llavaResponse.choices[0].message.content,
          model: llavaResponse.model,
          usage: llavaResponse.usage,
          image: {
            id: image.id,
            filename: image.filename,
            prompt: image.prompt
          }
        }
      });

    } catch (error) {
      console.error('Description generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate description'
      });
    }
  }

  // Activer/sauvegarder une description pour une image
  async activateDescription(req: Request, res: Response): Promise<void> {
    try {
      const { idImage, description } = req.body;

      if (!idImage) {
        res.status(400).json({
          success: false,
          error: 'idImage is required'
        });
        return;
      }

      if (!description || typeof description !== 'string' || description.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'description is required and must be a non-empty string'
        });
        return;
      }

      const imageId = parseInt(idImage);
      
      if (isNaN(imageId)) {
        res.status(400).json({
          success: false,
          error: 'idImage must be a valid number'
        });
        return;
      }

      // Vérifier que l'image existe
      const image = await this.imageService.getImageById(imageId);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }

      // Mettre à jour l'image avec la description
      const updatedImage = await this.imageService.updateImage(imageId, {
        description: description.trim()
      });

      res.json({
        success: true,
        message: 'Description activated successfully',
        data: {
          imageId: imageId,
          description: description.trim(),
          image: updatedImage
        }
      });

    } catch (error) {
      console.error('Description activation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate description'
      });
    }
  }

  // Récupérer la description d'une image
  async getDescription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);

      if (isNaN(imageId)) {
        res.status(400).json({
          success: false,
          error: 'Valid image ID is required'
        });
        return;
      }

      const image = await this.imageService.getImageById(imageId);

      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          imageId: imageId,
          description: image.description || null,
          hasDescription: !!image.description,
          image: {
            id: image.id,
            filename: image.filename,
            prompt: image.prompt
          }
        }
      });

    } catch (error) {
      console.error('Get description error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get description'
      });
    }
  }

  // Vérifier la santé de l'API LLaVA
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.llavaService.checkHealth();

      res.json({
        success: true,
        data: {
          llava_api_healthy: isHealthy,
          llava_api_url: process.env.LLAVA_API_URL || "http://localhost:8000"
        }
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      });
    }
  }
}