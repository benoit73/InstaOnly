import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { authenticateJWT } from '../middleware/index';

const router = Router();
const accountController = new AccountController();

// TOUTES les routes comptes sont protégées
router.get('/accounts', authenticateJWT, accountController.getAccounts.bind(accountController));
router.get('/accounts/:id', authenticateJWT, accountController.getAccountById.bind(accountController)); // Ajout de cette route
router.post('/accounts', authenticateJWT, accountController.createAccount.bind(accountController));
router.put('/accounts/:id', authenticateJWT, accountController.updateAccount.bind(accountController));
router.delete('/accounts/:id', authenticateJWT, accountController.deleteAccount.bind(accountController));

// Route pour définir l'image principale - protégée
router.put('/accounts/:id/main-image', authenticateJWT, accountController.setMainImage.bind(accountController));

export default router;