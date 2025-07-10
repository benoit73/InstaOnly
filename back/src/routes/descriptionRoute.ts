import { Router } from 'express';
import { DescriptionController } from '../controllers/descriptionController';
import { authenticateJWT } from '../middleware/index';

const router = Router();
const descriptionController = new DescriptionController();

// Générer une description pour une image
// GET /description/generate?imageId=123&prompt=custom_prompt
router.get('/description/generate', authenticateJWT, descriptionController.generateDescription.bind(descriptionController));

// Récupérer la description d'une image
// GET /description/123
// router.get('/description/:id', authenticateJWT, descriptionController.getDescription.bind(descriptionController));

// Vérifier la santé de l'API LLaVA
// GET /description/health
router.get('/description/health', authenticateJWT, descriptionController.checkHealth.bind(descriptionController));

export default router;