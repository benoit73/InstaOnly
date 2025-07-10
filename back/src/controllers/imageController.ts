import { Response, Request } from 'express';
import path from 'path';
import { ImageService } from '../services/imageService';
import { AuthenticatedUser } from '../types';

export class ImageController {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  // Générer une image
  async generateImg(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      // Ajoute le userId dans le body pour le service
      const result = await this.imageService.createImage({ ...req.body, userId: user.id });
      res.status(201).json({
        success: true,
        message: 'Image generated successfully',
        data: result
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

  // Récupérer toutes les images
  async getImages(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const images = await this.imageService.getImages(user.id);
      res.json({
        success: true,
        data: images,
        count: images.length
      });
    } catch (error: any) {
      console.error('Error fetching images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch images',
        message: error.message
      });
    }
  }

  // Récupérer une image par ID et servir le fichier
  async getImageById(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      const filePath = await this.imageService.getImageFilePath(Number(id), user.id);
      res.sendFile(path.resolve(filePath));
    } catch (error: any) {
      console.error('Error fetching image:', error);
      res.status(404).json({ 
        success: false,
        error: 'Image file not found',
        message: error.message
      });
    }
  }

  // Obtenir les informations d'une image
  async getImageInfo(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      const imageInfo = await this.imageService.getImageInfo(Number(id), user.id);
      res.json({
        success: true,
        data: imageInfo
      });
    } catch (error: any) {
      console.error('Error fetching image info:', error);
      res.status(404).json({ 
        success: false,
        error: 'Image not found',
        message: error.message
      });
    }
  }

  // Récupérer les images par compte
  async getImagesByAccount(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { accountId } = req.params;
      const { status, includeDeleted } = req.query;
      const filters = {
        status: status as string,
        includeDeleted: includeDeleted === 'true'
      };
      // Optionnel : tu peux vérifier ici que le compte appartient bien à user.id
      const images = await this.imageService.getImagesByAccount(Number(accountId), user.id, filters);
      res.json({
        success: true,
        data: images,
        count: images.length
      });
    } catch (error: any) {
      console.error('Error fetching images by account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch images',
        message: error.message
      });
    }
  }

  // Mettre à jour une image
  async updateImage(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      const image = await this.imageService.updateImage(Number(id),  user.id, req.body);
      res.json({
        success: true,
        data: image
      });
    } catch (error: any) {
      console.error('Error updating image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update image',
        message: error.message
      });
    }
  }

  // Supprimer une image
  async deleteImage(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      await this.imageService.deleteImage(Number(id), user.id);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        message: error.message
      });
    }
  }

  // Marquer une image comme supprimée
  async markAsDeleted(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      const result = await this.imageService.markAsDeleted(Number(id), user.id);
      res.json({
        success: true,
        message: 'Image marked as deleted successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error marking image as deleted:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark image as deleted',
        message: error.message
      });
    }
  }

  // Marquer une image comme sauvegardée
  async markAsSaved(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    try {
      const { id } = req.params;
      // Optionnel : tu peux vérifier ici que l'image appartient bien à user.id
      const result = await this.imageService.markAsSaved(Number(id), user.id);
      res.json({
        success: true,
        message: 'Image marked as saved successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error marking image as deleted:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark image as deleted',
        message: error.message
      });
    }
  }

  // Publier une photo (placeholder)
  async publishPhoto(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    res.status(501).json({
      success: false,
      error: 'Instagram publishing not implemented yet'
    });
  }

  // Programmer une photo (placeholder)
  async schedulePhoto(req: Request, res: Response): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    res.status(501).json({
      success: false,
      error: 'Photo scheduling not implemented yet'
    });
  }
}