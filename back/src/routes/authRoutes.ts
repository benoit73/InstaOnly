import { Router } from 'express';
import { googleAuth, googleCallback, getProfile, checkAuth, logout } from '../controllers/authController';
import { authenticateJWT } from '../middleware/index';

const router = Router();

// Routes OAuth Google - PAS DE PROTECTION (publiques)
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);

// Routes protégées par JWT
router.get('/auth/profile', authenticateJWT, getProfile);
router.get('/auth/check', authenticateJWT, checkAuth);
router.post('/auth/logout', logout); // Pas besoin de protection, supprime juste le token côté client

export default router;