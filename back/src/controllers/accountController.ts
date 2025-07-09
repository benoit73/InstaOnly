import { Request, Response } from 'express';
import { AccountService } from '../services/accountService';
import { AuthenticatedUser } from '../types';

export class AccountController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  // Créer un compte
  async createAccount(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const user: AuthenticatedUser | undefined = req.user;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!user) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      const account = await this.accountService.createAccount({
        name,
        description,
        userId: user.id
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account
      });

    } catch (error) {
      console.error('Error creating account:', error);
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create account' });
    }
  }

  // Lister tous les comptes
  async getAccounts(req: Request, res: Response) {
    try {
      const user: AuthenticatedUser | undefined = req.user;
      const { userId } = req.query;
      
      // Si un userId est fourni en query, on l'utilise, sinon on utilise l'utilisateur connecté
      const targetUserId = userId ? Number(userId) : user?.id;
      
      const accounts = await this.accountService.getAccounts(targetUserId);

      res.json({
        success: true,
        data: accounts
      });

    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }

  // Récupérer un compte par ID avec son image principale
  async getAccountById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user: AuthenticatedUser | undefined = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
        return;
      }

      const account = await this.accountService.getAccountById(id);

      // Vérifier que l'utilisateur a accès à ce compte
      if (account.userId !== user.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied to this account'
        });
        return;
      }

      res.json({
        success: true,
        data: account
      });

    } catch (error) {
      console.error('Error fetching account:', error);
      if (error instanceof Error && error.message === 'Account not found') {
        res.status(404).json({
          success: false,
          error: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Failed to fetch account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mettre à jour un compte
  async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const user: AuthenticatedUser | undefined = req.user;

      if (!user) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Vérifier que l'utilisateur possède ce compte
      const existingAccount = await this.accountService.getAccountById(id);
      if (existingAccount.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied to this account' });
      }

      const account = await this.accountService.updateAccount(id, {
        name,
        description
      });

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: account
      });

    } catch (error) {
      console.error('Error updating account:', error);
      if (error instanceof Error && error.message === 'Account not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update account' });
    }
  }

  // Supprimer un compte
  async deleteAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user: AuthenticatedUser | undefined = req.user;

      if (!user) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Vérifier que l'utilisateur possède ce compte
      const existingAccount = await this.accountService.getAccountById(id);
      if (existingAccount.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied to this account' });
      }

      await this.accountService.deleteAccount(id);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error && error.message === 'Account not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  // Définir l'image principale d'un compte
  async setMainImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { imageId } = req.body;
      const user: AuthenticatedUser | undefined = req.user;

      if (!user) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      if (!imageId) {
        return res.status(400).json({ error: 'imageId is required' });
      }

      // Vérifier que l'utilisateur possède ce compte
      const existingAccount = await this.accountService.getAccountById(id);
      if (existingAccount.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied to this account' });
      }

      // Convertir les string en number
      const result = await this.accountService.setMainImage(Number(id), Number(imageId));

      res.json({
        success: true,
        message: 'Main image set successfully',
        data: result
      });

    } catch (error) {
      console.error('Error setting main image:', error);
      if (error instanceof Error) {
        if (error.message === 'Account not found') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Image not found for this account') {
          return res.status(404).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to set main image' });
    }
  }
}