import { getAuthHeaders } from '../helper/authHelper';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export interface Photo {
  id: number;
  filename: string;
  filePath: string;
  prompt: string;
  description?: string;
  accountId?: number; // Optionnel car peut être null
  isStory?: boolean;
  likes?: number;
  comments?: number;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'scheduled' | 'published';
  instagramMediaId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  generatedBy?: 'ai' | 'upload' | 'template';
  isDeleted?: boolean; // NOUVEAU CHAMP AJOUTÉ
  account?: {
    id: number;
    name: string;
  } | string; // Peut être un objet ou une string selon le backend
  metadata?: {
    prompt?: string;
    model?: string;
    style?: string;
    dimensions?: { width: number; height: number };
  };
}

export interface CreatePhotoRequest {
  image: File;
  description?: string;
  accountId: number;
  isStory?: boolean;
  status?: 'draft' | 'scheduled';
  scheduledAt?: string;
  metadata?: Photo['metadata'];
}

export interface UpdatePhotoRequest {
  description?: string;
  prompt?: string;
  isStory?: boolean;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
}

export interface GenerateRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  denoising_strength?: number;
  cfg_scale?: number;
  sampler_index?: number;
  accountId: number;
  description?: string;
  isStory?: boolean;
}

class ImageService {
  // Génère l'URL pour accéder à un fichier d'image par ID
  getImageFileUrl(imageId: number): string {
    return `${BACKEND_URL}/images/${imageId}/file`;
  }

  // Récupérer toutes les photos
  async getPhotos(status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    try {
      const url = status ? `${BACKEND_URL}/photos?status=${status}` : `${BACKEND_URL}/photos`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      throw error;
    }
  }

  // Récupérer les photos d'un compte spécifique
  async getPhotosByAccount(accountId: number, status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    try {
      const url = status 
        ? `${BACKEND_URL}/photos/account/${accountId}?status=${status}` 
        : `${BACKEND_URL}/photos/account/${accountId}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la récupération des photos du compte:', error);
      throw error;
    }
  }

  // Récupérer une photo par ID
  async getPhoto(id: number): Promise<Photo> {
    try {
      const response = await fetch(`${BACKEND_URL}/photos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la récupération de la photo:', error);
      throw error;
    }
  }

  // Générer une image de base avec IA (txt2img)
  async generateBaseImage(generateData: GenerateRequest): Promise<Photo> {
    try {
      const response = await fetch(`${BACKEND_URL}/images/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(generateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image de base:', error);
      throw error;
    }
  }

  // Générer une image à partir de l'image de base
  async generateImageFromBase(generateData: GenerateRequest & { baseImageId: number }): Promise<Photo> {
    try {
      const response = await fetch(`${BACKEND_URL}/images/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(generateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image à partir du profil:', error);
      throw error;
    }
  }

  // Mettre à jour une photo
  async updatePhoto(id: number, updateData: UpdatePhotoRequest): Promise<Photo> {
    try {
      const response = await fetch(`${BACKEND_URL}/photos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      throw error;
    }
  }

  // Supprimer une photo
  async deletePhoto(id: number): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/photos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw error;
    }
  }

  // Dupliquer une photo
  async duplicatePhoto(id: number): Promise<Photo> {
    try {
      const response = await fetch(`${BACKEND_URL}/photos/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la duplication de la photo:', error);
      throw error;
    }
  }

  // Créer des variantes d'une photo
  async createVariants(id: number, count: number = 3): Promise<Photo[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/photos/${id}/variants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ count }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erreur lors de la création des variantes:', error);
      throw error;
    }
  }

  // Alternative : obtenir l'URL via le chemin direct
  getImageDirectUrl(photo: Photo): string {
    // Servir via les fichiers statiques (garde / et utilise /uploads)
    return `${BACKEND_URL}/files/${photo.filePath.replace('uploads/', '')}`;
  }

  // Marquer une photo comme sauvegardée
  async markAsSaved(photoId: number): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/images/${photoId}/mark-saved`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark photo as saved');
    }
  }

  // Méthodes pour la publication (à implémenter côté backend)
  async publishPhoto(id: number): Promise<{ instagramMediaId: string; permalink: string }> {
    throw new Error('Publication Instagram non implémentée dans le backend v2');
  }

  async schedulePhoto(id: number, scheduledAt: string): Promise<Photo> {
    throw new Error('Programmation non implémentée dans le backend v2');
  }

  async getPhotoStats(id: number): Promise<{ 
    likes: number; 
    comments: number; 
    views: number;
  }> {
    throw new Error('Statistiques non implémentées dans le backend v2');
  }
}

export const imageService = new ImageService();

// Export pour compatibilité avec l'ancien photoService
export const photoService = imageService;