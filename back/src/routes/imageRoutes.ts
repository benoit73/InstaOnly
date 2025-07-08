import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import path from 'path';
import fs from 'fs';

const router = Router();
const imageController = new ImageController();

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

// Routes principales pour les images
router.get('/images/:id/file', serveImageFile); 
router.get('/images/:id', imageController.getImageById.bind(imageController));
router.delete('/images/:id', imageController.deleteImage.bind(imageController));
router.get('/images/account/:accountId', imageController.getImagesByAccount.bind(imageController));
router.get('/images/users/:userId', imageController.getImages.bind(imageController));

// Routes de génération
router.post('/images/generate', imageController.generateImg.bind(imageController));

// Routes pour la publication (à implémenter)
router.post('/photos/:id/publish', imageController.publishPhoto.bind(imageController));
router.post('/photos/:id/schedule', imageController.schedulePhoto.bind(imageController));

export default router;