const API_BASE_URL = process.env.NEXT_PUBLIC_BACK_URL || 'http://localhost:3001/api';

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
    return `${API_BASE_URL}/photos/${imageId}/file`;
  }

  // Récupérer toutes les photos
  async getPhotos(status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    try {
      const url = status ? `${API_BASE_URL}/photos?status=${status}` : `${API_BASE_URL}/photos`;
      const response = await fetch(url, {
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
      console.error('Erreur lors de la récupération des photos:', error);
      throw error;
    }
  }

  // Récupérer les photos d'un compte spécifique
  async getPhotosByAccount(accountId: number, status?: 'draft' | 'scheduled' | 'published'): Promise<Photo[]> {
    try {
      const url = status 
        ? `${API_BASE_URL}/photos/account/${accountId}?status=${status}` 
        : `${API_BASE_URL}/photos/account/${accountId}`;
        
      const response = await fetch(url, {
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
      console.error('Erreur lors de la récupération des photos du compte:', error);
      throw error;
    }
  }

  // Récupérer une photo par ID
  async getPhoto(id: number): Promise<Photo> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
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
      console.error('Erreur lors de la récupération de la photo:', error);
      throw error;
    }
  }

  // Générer une image de base avec IA (txt2img)
  async generateBaseImage(generateData: GenerateRequest): Promise<Photo> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/generate/txt2txt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/photos/generate/img2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Générer une photo avec IA (alias pour generateBaseImage)
  async generatePhoto(generateData: GenerateRequest): Promise<Photo> {
    return this.generateBaseImage(generateData);
  }

  // Mettre à jour une photo
  async updatePhoto(id: number, updateData: UpdatePhotoRequest): Promise<Photo> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/photos/${id}/duplicate`, {
        method: 'POST',
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
      console.error('Erreur lors de la duplication de la photo:', error);
      throw error;
    }
  }

  // Créer des variantes d'une photo
  async createVariants(id: number, count: number = 3): Promise<Photo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${id}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Obtenir l'URL complète d'une image
  getImageUrl(photo: Photo | any): string {
    console.log("getImageUrl - photo:", photo); // Debug
    
    // Si c'est une image générée avec imageUrl
    if (photo.imageUrl) {
      // Si l'URL commence par /api, construire l'URL complète
      if (photo.imageUrl.startsWith('/api/')) {
        // Gardez le baseURL avec /api et ajoutez l'imageUrl
        const baseUrl = process.env.NEXT_PUBLIC_BACK_URL?.replace('/api', '') || 'http://localhost:3001';
        return `${baseUrl}${photo.imageUrl}`;
      }
      return photo.imageUrl;
    }
    
    // Si c'est une image avec un filePath direct
    if (photo.filePath && !photo.id) {
      // Utiliser l'API pour servir le fichier
      return `${API_BASE_URL}/files/${photo.filePath.replace('uploads/', '')}`;
    }
    
    // Structure normale avec ID
    if (photo.id) {
      return `${API_BASE_URL}/images/${photo.id}/file`;
    }
    
    // Fallback
    console.warn("Aucune URL d'image trouvée pour:", photo);
    return '';
  }

  // Alternative : obtenir l'URL via le chemin direct
  getImageDirectUrl(photo: Photo): string {
    // Servir via les fichiers statiques (garde /api et utilise /uploads)
    return `${API_BASE_URL}/files/${photo.filePath.replace('uploads/', '')}`;
  }

  // Marquer une photo comme supprimée (soft delete)
  async markAsDeleted(photoId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}/mark-deleted`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark photo as deleted');
    }
  }

  // Restaurer une photo supprimée
  async restorePhoto(photoId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}/restore`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to restore photo');
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