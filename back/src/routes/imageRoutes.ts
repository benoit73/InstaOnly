import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import path from 'path';
import fs from 'fs';

const router = Router();
const imageController = new ImageController();

// Routes pour les images/photos
router.get('/images', imageController.getImages.bind(imageController));
router.get('/images/:id', imageController.getImageById.bind(imageController));
router.get('/images/:id/info', imageController.getImageInfo.bind(imageController));
router.delete('/images/:id', imageController.deleteImage.bind(imageController));

// Fonction utilitaire pour servir les fichiers d'images
const serveImageFile = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { Image } = require('../models');
    
    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filePath = path.resolve(image.filePath);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Définir le type de contenu selon l'extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                       ext === '.gif' ? 'image/gif' : 
                       ext === '.webp' ? 'image/webp' : 
                       'image/png'; // par défaut
    
    res.contentType(contentType);
    
    // Envoyer le fichier
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
};

// Route pour servir les fichiers d'images
router.get('/images/:id/file', serveImageFile);

// Routes pour les photos (alias des images pour correspondre au frontend)
router.get('/photos', imageController.getImages.bind(imageController));
router.get('/photos/:id', imageController.getImageById.bind(imageController));
router.get('/photos/:id/file', serveImageFile); // Utiliser la même fonction
router.put('/photos/:id', imageController.updateImage.bind(imageController));
router.delete('/photos/:id', imageController.deleteImage.bind(imageController));
router.get('/photos/account/:accountId', imageController.getImagesByAccount.bind(imageController));
router.post('/photos/:id/duplicate', imageController.duplicateImage.bind(imageController));
router.post('/photos/:id/variants', imageController.createVariants.bind(imageController));

// Routes de génération
router.post('/photos/generate/base', imageController.generateMainImage.bind(imageController));
router.post('/photos/generate/fromimage', imageController.generateImageFromImage.bind(imageController));
router.post('/photos/generate', imageController.generateMainImage.bind(imageController));
router.post('/generate-main-image', imageController.generateMainImage.bind(imageController));

// Routes pour la publication (à implémenter)
router.post('/photos/:id/publish', imageController.publishPhoto.bind(imageController));
router.post('/photos/:id/schedule', imageController.schedulePhoto.bind(imageController));

export default router;