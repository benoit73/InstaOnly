const API_BASE_URL = process.env.NEXT_PUBLIC_BACK_URL || 'http://localhost:3001/api';

export interface Account {
  id: number;
  name: string; // Correspond au backend v2
  description: string; // Correspond au backend v2
  username?: string; // Optionnel pour compatibilité
  followers?: string;
  following?: string;
  posts?: number;
  avatar?: string;
  bio?: string;
  isConnected?: boolean;
  userId: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  mainImage?: {
    id: number;
    filename: string;
    filePath: string;
    prompt: string;
  };
  imagesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  name: string; // Correspond au backend v2
  description?: string;
  userId: number;
}

export interface UpdateAccountRequest {
  name?: string;
  description?: string;
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
    try {
      console.log('Fetching accounts from:', `${API_BASE_URL}/accounts`);
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Le backend v2 retourne { success: true, data: [...] }
      return result.data || result;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Récupérer un compte par ID
  async getAccount(id: number): Promise<Account> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Récupérer un compte avec son image principale
  async getAccountWithMainImage(id: number): Promise<Account & { mainImage?: Photo }> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error);
      throw error;
    }
  },

  // Créer un nouveau compte
  async createAccount(accountData: CreateAccountRequest): Promise<Account> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Mettre à jour un compte
  async updateAccount(id: number, updateData: UpdateAccountRequest): Promise<Account> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Supprimer un compte
  async deleteAccount(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Définir l'image principale d'un compte
  async setMainImage(accountId: number, imageId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/main-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  // Les autres méthodes restent inchangées pour la compatibilité...
  async connectInstagramAccount(code: string): Promise<Account> {
    // À implémenter avec votre logique OAuth
    throw new Error('Non implémenté dans le backend v2');
  },

  async disconnectAccount(id: number): Promise<void> {
    // À implémenter
    throw new Error('Non implémenté dans le backend v2');
  },

  async getAccountStats(id: number): Promise<AccountStats> {
    // À implémenter
    throw new Error('Non implémenté dans le backend v2');
  },

  async syncAccount(id: number): Promise<Account> {
    // À implémenter
    throw new Error('Non implémenté dans le backend v2');
  },

  async checkConnectionStatus(id: number): Promise<{ isConnected: boolean; lastSync: string }> {
    // À implémenter
    throw new Error('Non implémenté dans le backend v2');
  },
};