const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export interface Photo {
  id: string;
  image: string;
  description: string;
  account: string;
  accountId: number;
  isStory: boolean;
  likes?: number;
  comments?: number;
  date: string;
  status: 'draft' | 'scheduled' | 'published';
  instagramMediaId?: string; // ID du média sur Instagram (si publié)
  scheduledAt?: string;
  publishedAt?: string;
  generatedBy?: 'ai' | 'upload' | 'template';
  metadata?: {
    prompt?: string; // Pour les images générées par IA
    model?: string;
    style?: string;
    dimensions?: { width: number; height: number };
  };
}

export interface CreatePhotoRequest {
  image: File;
  description: string;
  accountId: number;
  isStory: boolean;
  status?: 'draft' | 'scheduled';
  scheduledAt?: string;
  metadata?: Photo['metadata'];
}

export interface UpdatePhotoRequest {
  description?: string;
  isStory?: boolean;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
}

export interface GeneratePhotoRequest {
  prompt: string;
  style?: string;
  dimensions?: { width: number; height: number };
  model?: string;
  accountId: number;
  description?: string;
  isStory?: boolean;
}

export const photoService = {
  // Récupérer toutes les photos (publiées et non publiées)
  async getPhotos(status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    const url = status ? `${API_BASE_URL}/photos?status=${status}` : `${API_BASE_URL}/photos`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des photos');
    }
    return response.json();
  },

  // Récupérer les photos d'un compte spécifique
  async getPhotosByAccount(accountId: number, status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    const url = status 
      ? `${API_BASE_URL}/photos/account/${accountId}?status=${status}` 
      : `${API_BASE_URL}/photos/account/${accountId}`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des photos du compte');
    }
    return response.json();
  },

  // Récupérer une photo par ID
  async getPhoto(id: string): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la photo');
    }
    return response.json();
  },

 

  // Générer une photo avec IA
  async generatePhoto(generateData: GeneratePhotoRequest): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(generateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la photo');
    }
    return response.json();
  },

  // Générer une image de base avec IA
  async generateBaseImage(generateData: {
    prompt: string;
    negative_prompt?: string;
    width: number;
    height: number;
    steps: number;
    denoising_strength: number;
    cfg_scale: number;
    sampler_index: number;
    accountId: number;
    description?: string;
    isStory: boolean;
  }): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/generate/base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(generateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'image de base');
    }
    return response.json();
  },

  // Générer une image à partir d'un profil
  async generateProfileImage(generateData: {
    prompt: string;
    negative_prompt?: string;
    width: number;
    height: number;
    steps: number;
    denoising_strength: number;
    cfg_scale: number;
    sampler_index: number;
    accountId: number;
    baseImageId: string;
    description?: string;
    isStory: boolean;
  }): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/generate/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(generateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'image à partir du profil');
    }
    return response.json();
  },

  // Mettre à jour une photo
  async updatePhoto(id: string, updateData: UpdatePhotoRequest): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la photo');
    }
    return response.json();
  },

  // Supprimer une photo
  async deletePhoto(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la photo');
    }
  },

  // Publier une photo sur Instagram (utilise instagramService en interne)
  async publishPhoto(id: string): Promise<{ instagramMediaId: string; permalink: string }> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la publication de la photo');
    }
    return response.json();
  },

  // Programmer une photo
  async schedulePhoto(id: string, scheduledAt: string): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ scheduledAt }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la programmation de la photo');
    }
    return response.json();
  },

  // Récupérer les statistiques d'une photo (local et Instagram)
  async getPhotoStats(id: string): Promise<{ 
    likes: number; 
    comments: number; 
    views: number;
    reach?: number;
    impressions?: number;
    saves?: number;
    shares?: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}/stats`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  },

  // Dupliquer une photo
  async duplicatePhoto(id: string): Promise<Photo> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la duplication de la photo');
    }
    return response.json();
  },

  // Créer des variantes d'une photo (générations IA similaires)
  async createVariants(id: string, count: number = 3): Promise<Photo[]> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ count }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création des variantes');
    }
    return response.json();
  },

  // Récupérer le token d'authentification
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};