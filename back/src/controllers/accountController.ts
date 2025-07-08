import { Request, Response } from 'express';
import { Account, User, Image } from '../models';

export class AccountController {
  // Créer un compte
  async createAccount(req: Request, res: Response) {
    try {
      const { name, description, userId } = req.body;

      if (!name || !userId) {
        return res.status(400).json({ error: 'Name and userId are required' });
      }

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const account = await Account.create({
        name,
        description,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          id: account.id,
          name: account.name,
          description: account.description,
          userId: account.userId,
          createdAt: account.createdAt,
        }
      });

    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }

  // Lister tous les comptes
  async getAccounts(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      const whereClause: any = {};
      if (userId) {
        whereClause.userId = userId;
      }

      const accounts = await Account.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Image,
            as: 'mainImage',
            attributes: ['id', 'filename', 'filePath', 'prompt']
          },
          {
            model: Image,
            as: 'images',
            attributes: ['id', 'filename']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          description: account.description,
          userId: account.userId,
          user: account.user,
          mainImage: account.mainImage,
          imagesCount: account.images?.length || 0,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        }))
      });

    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }

  // Obtenir un compte par ID
  async getAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const account: any = await Account.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Image,
            as: 'mainImage',
            attributes: ['id', 'filename', 'filePath', 'prompt']
          },
          {
            model: Image,
            as: 'images',
            attributes: ['id', 'filename', 'prompt', 'createdAt']
          }
        ]
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json({
        success: true,
        data: {
          id: account.id,
          name: account.name,
          description: account.description,
          userId: account.userId,
          user: account.user,
          mainImage: account.mainImage,
          images: account.images || [],
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        }
      });

    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ error: 'Failed to fetch account' });
    }
  }

  // Mettre à jour un compte
  async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const account = await Account.findByPk(id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      await account.update({ name, description });

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: {
          id: account.id,
          name: account.name,
          description: account.description,
          updatedAt: account.updatedAt
        }
      });

    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: 'Failed to update account' });
    }
  }

  // Supprimer un compte
  async deleteAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const account = await Account.findByPk(id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Supprimer toutes les images associées
      await Image.destroy({ where: { accountId: id } });
      
      await account.destroy();

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  // Définir l'image principale d'un compte
  async setMainImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { imageId } = req.body;

      if (!imageId) {
        return res.status(400).json({ error: 'imageId is required' });
      }

      const account = await Account.findByPk(id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Vérifier que l'image existe et appartient au compte
      const image = await Image.findOne({
        where: { id: imageId, accountId: id }
      });
      if (!image) {
        return res.status(404).json({ error: 'Image not found for this account' });
      }

      await account.update({ mainImageId: imageId });

      res.json({
        success: true,
        message: 'Main image set successfully',
        data: {
          accountId: account.id,
          mainImageId: imageId
        }
      });

    } catch (error) {
      console.error('Error setting main image:', error);
      res.status(500).json({ error: 'Failed to set main image' });
    }
  }
}