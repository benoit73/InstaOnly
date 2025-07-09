import { Request } from 'express';

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type pour l'utilisateur authentifié (sans le mot de passe)
export type AuthenticatedUser = Omit<UserAttributes, 'password'>;

// Interface personnalisée pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Solution alternative : surcharger le module passport pour éviter les conflits
declare module 'passport' {
  interface Authenticator {
    use(strategy: any): this;
  }
}

// Extension plus agressive de l'interface Request
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: User;
    }
  }
}