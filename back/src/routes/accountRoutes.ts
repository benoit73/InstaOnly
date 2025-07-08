import { Router } from 'express';
import { AccountController } from '../controllers/accountController';

const router = Router();
const accountController = new AccountController();

// Routes CRUD pour les comptes
router.get('/accounts', accountController.getAccounts.bind(accountController));
router.get('/accounts/:id', accountController.getAccountById.bind(accountController)); // Ajout de cette route
router.post('/accounts', accountController.createAccount.bind(accountController));
router.put('/accounts/:id', accountController.updateAccount.bind(accountController));
router.delete('/accounts/:id', accountController.deleteAccount.bind(accountController));

// Route pour définir l'image principale
router.put('/accounts/:id/main-image', accountController.setMainImage.bind(accountController));

export default router;