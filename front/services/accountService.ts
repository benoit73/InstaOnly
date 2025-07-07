const API_BASE_URL = process.env.NEXT_PUBLIC_BACK_URL || 'http://localhost:3001';

export interface Account {
  id: number;
  username: string;
  followers: string;
  following: string;
  posts: number;
  avatar: string;
  bio: string;
  isConnected: boolean;
}

export interface CreateAccountRequest {
  username: string;
  password?: string;
  accessToken?: string;
}

export interface UpdateAccountRequest {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface AccountStats {
  followers: number;
  following: number;
  posts: number;
  likes: number;
  comments: number;
  views: number;
  engagement: number;
}

export const accountService = {
  // Récupérer tous les comptes
  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) {
        console.log('test' + API_BASE_URL)
      throw new Error('Erreur lors de la récupération des comptes');
    }
    return response.json();
  },

  // Récupérer un compte par ID
  async getAccount(id: number): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du compte');
    }
    return response.json();
  },

  // Créer un nouveau compte
  async createAccount(accountData: CreateAccountRequest): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du compte');
    }
    return response.json();
  },

  // Mettre à jour un compte
  async updateAccount(id: number, updateData: UpdateAccountRequest): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du compte');
    }
    return response.json();
  },

  // Supprimer un compte
  async deleteAccount(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du compte');
    }
  },

  // Connecter un compte Instagram via OAuth
  async connectInstagramAccount(code: string): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la connexion du compte Instagram');
    }
    return response.json();
  },

  // Déconnecter un compte Instagram
  async disconnectAccount(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}/disconnect`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la déconnexion du compte');
    }
  },

  // Récupérer les statistiques d'un compte
  async getAccountStats(id: number): Promise<AccountStats> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}/stats`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  },

  // Synchroniser les données d'un compte avec Instagram
  async syncAccount(id: number): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la synchronisation du compte');
    }
    return response.json();
  },

  // Vérifier le statut de connexion d'un compte
  async checkConnectionStatus(id: number): Promise<{ isConnected: boolean; lastSync: string }> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}/status`);
    if (!response.ok) {
      throw new Error('Erreur lors de la vérification du statut');
    }
    return response.json();
  },
};