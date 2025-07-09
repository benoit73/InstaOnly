const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export interface Account {
  id: number;
  name: string;
  description?: string;
  mainImageId?: number;
  mainImage?: {
    id: number;
    filename: string;
    filePath: string;
  };
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  accounts?: Account[];
  accountsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithAccountsResponse {
  success: boolean;
  data: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const userService = {
  // Connexion utilisateur
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la connexion');
    }

    const data = await response.json();
    
    // Stocker le token dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  },

  // Inscription utilisateur
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'inscription');
    }

    const data = await response.json();
    
    // Stocker le token dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  },

  // Déconnexion utilisateur
  async logout(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Supprimer les tokens du localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Récupérer l'utilisateur actuel avec ses comptes
  async getUserByToken(): Promise<User> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalide, supprimer les tokens stockés
        this.logout();
        throw new Error('Session expirée');
      }
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }

    const data: UserWithAccountsResponse = await response.json();
    return data.data;
  },

  // Alias pour getUserByToken (pour compatibilité)
  async getProfile(): Promise<User> {
    return this.getUserByToken();
  },

  // Récupérer uniquement les comptes de l'utilisateur
  async getUserAccounts(): Promise<Account[]> {
    const user = await this.getUserByToken();
    return user.accounts || [];
  },

  // Vérifier si l'utilisateur a des comptes
  async hasAccounts(): Promise<boolean> {
    const user = await this.getUserByToken();
    return (user.accountsCount || 0) > 0;
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(updateData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }

    return response.json();
  },

  // Changer le mot de passe
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du changement de mot de passe');
    }
  },

  // Rafraîchir le token
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Token de rafraîchissement non disponible');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token');
    }

    const data = await response.json();
    
    // Mettre à jour le token dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }

    return data.token;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Récupérer le token depuis le localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Récupérer le refresh token depuis le localStorage
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  // Supprimer un utilisateur (admin uniquement)
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  },

  // Récupérer tous les utilisateurs (admin uniquement)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    return response.json();
  },
};