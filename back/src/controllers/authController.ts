import { Request, Response } from 'express';
import passport from 'passport';
import { generateJWT } from '../config/passport';

// Rediriger vers Google OAuth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Callback Google OAuth
export const googleCallback = (req: Request, res: Response, next: any) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error`);
    }

    if (!user) {
        console.error('Utilisateur non créé', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error`);
    }

    // Générer le JWT
    const token = generateJWT(user);
    
    // Rediriger vers le frontend avec le token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  })(req, res, next);
};

// Récupérer le profil utilisateur
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

// Déconnexion
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Déconnecté avec succès'
  });
};

// Endpoint pour vérifier si l'utilisateur est connecté
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
};