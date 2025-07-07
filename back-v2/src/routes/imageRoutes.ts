import { Router } from 'express';
import { ImageController } from '../controllers/imageController';

const router = Router();
const imageController = new ImageController();

// Routes principales
router.post('/generate-main-image', imageController.generateMainImage.bind(imageController)); // txt2img
router.post('/generate-image', imageController.generateImage.bind(imageController)); // img2img
router.get('/images', imageController.getImages.bind(imageController));
router.get('/images/:id', imageController.getImageById.bind(imageController));
router.get('/images/:id/info', imageController.getImageInfo.bind(imageController));

export default router;