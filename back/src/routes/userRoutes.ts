import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateJWT } from '../middleware/index';

const router = Router();
const userController = new UserController();

// TOUTES les routes utilisateurs sont protégées
router.get('/user/me', authenticateJWT, userController.getUserByToken.bind(userController));
router.post('/users', authenticateJWT, userController.createUser.bind(userController));
router.get('/users', authenticateJWT, userController.getUsers.bind(userController));
router.get('/users/:id', authenticateJWT, userController.getUserById.bind(userController));
router.put('/users/:id', authenticateJWT, userController.updateUser.bind(userController));
router.delete('/users/:id', authenticateJWT, userController.deleteUser.bind(userController));

export default router;