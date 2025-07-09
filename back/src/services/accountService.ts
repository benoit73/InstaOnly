import { Account, User, Image } from '../models';

export class AccountService {
  // Créer un compte
  async createAccount(data: { name: string; description?: string; userId: number }) {
    const { name, description, userId } = data;

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const account = await Account.create({
      name,
      description,
      userId,
    });

    return {
      id: account.id,
      name: account.name,
      description: account.description,
      userId: account.userId,
      createdAt: account.createdAt,
    };
  }

  // Lister tous les comptes
  async getAccounts(userId: number) {
    const accounts = await Account.findAll({
      where: { userId: userId },
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

    return accounts.map((account: any) => ({
      id: account.id,
      name: account.name,
      description: account.description,
      userId: account.userId,
      user: account.user,
      mainImage: account.mainImage,
      imagesCount: account.images?.length || 0,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));
  }

  // Récupérer un compte par ID
  async getAccountById(id: string) {
    const account = await Account.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Image,
          as: 'mainImage',
          attributes: ['id', 'filename', 'filePath', 'prompt', 'width', 'height']
        }
      ]
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  }

  // Mettre à jour un compte
  async updateAccount(id: string, data: { name?: string; description?: string }) {
    const account = await Account.findByPk(id);
    if (!account) {
      throw new Error('Account not found');
    }

    await account.update(data);

    return {
      id: account.id,
      name: account.name,
      description: account.description,
      updatedAt: account.updatedAt
    };
  }

  // Supprimer un compte
  async deleteAccount(id: string) {
    const account = await Account.findByPk(id);
    if (!account) {
      throw new Error('Account not found');
    }

    // Supprimer toutes les images associées
    await Image.destroy({ where: { accountId: id } });
    
    await account.destroy();

    return { message: 'Account deleted successfully' };
  }

  // Définir l'image principale d'un compte
  async setMainImage(accountId: number, imageId: number) {
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Vérifier que l'image existe et appartient au compte
    const image = await Image.findOne({
      where: { id: imageId, accountId }
    });
    if (!image) {
      throw new Error('Image not found for this account');
    }

    await account.update({ mainImageId: imageId });

    return {
      accountId: account.id,
      mainImageId: imageId
    };
  }
}