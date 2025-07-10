import { Request, Response, NextFunction } from 'express';
import { request } from 'http';
import passport from 'passport';

// Middleware for logging requests
export const logger = (req: Request, res: Response, next: NextFunction): void => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// Middleware for validating request body for /generate route
export const validateGenerateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ 
            success: false,
            error: 'Prompt is required' 
        });
        return;
    }
    next();
};

// Middleware d'authentification JWT
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  console.log('req');
  // Vérifier si le header Authorization existe
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Token d\'authentification manquant',
      message: 'Veuillez vous connecter pour accéder à cette ressource'
    });
    return;
  }

  // Vérifier le format du token
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Format de token invalide',
      message: 'Le token doit être au format "Bearer <token>"'
    });
    return;
  }

  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error('JWT Authentication error:', err);
      res.status(500).json({
        success: false,
        error: 'Erreur d\'authentification',
        message: 'Erreur interne du serveur'
      });
      return;
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification invalide',
        message: info?.message || 'Veuillez vous reconnecter'
      });
      return;
    }

    // Ajouter l'utilisateur à la requête
    (req as any).user = user;
    next();
  })(req, res, next);

};

// Middleware d'authentification optionnelle
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Pas de token, on continue sans utilisateur
    next();
    return;
  }

  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (user) {
      (req as any).user = user;
    }
    // On continue même en cas d'erreur (authentification optionnelle)
    next();
  })(req, res, next);
};