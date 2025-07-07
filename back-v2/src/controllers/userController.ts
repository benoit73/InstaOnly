import { Request, Response } from 'express';
import { User, Account } from '../models';

export class UserController {
  // Créer un utilisateur
  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
      }

      const user = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        }
      });

    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Lister tous les utilisateurs
  async getUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Account,
            as: 'accounts',
            attributes: ['id', 'name', 'description']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: users.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          accountsCount: user.accounts?.length || 0,
          accounts: user.accounts || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Obtenir un utilisateur par ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Account,
            as: 'accounts',
            attributes: ['id', 'name', 'description', 'mainImageId']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          accounts: user.accounts || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ username, email });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          updatedAt: user.updatedAt
        }
      });

    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Supprimer un utilisateur
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Supprimer tous les comptes associés
      await Account.destroy({ where: { userId: id } });
      
      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}