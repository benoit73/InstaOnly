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

// Interface personnalisée pour les requêtes authentifiées (optionnel, à utiliser explicitement si besoin)
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}