const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000/';

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  media_product_type?: 'AD' | 'FEED' | 'STORY' | 'REELS';
}

export interface InstagramAccount {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';
  media_count: number;
  followers_count: number;
  follows_count: number;
  profile_picture_url: string;
  biography?: string;
  website?: string;
}

export interface PublishMediaRequest {
  image_url?: string;
  video_url?: string;
  caption?: string;
  location_id?: string;
  user_tags?: Array<{
    username: string;
    x: number;
    y: number;
  }>;
  is_carousel_item?: boolean;
  children?: string[]; // Media IDs for carousel
}

export interface PublishStoryRequest {
  image_url?: string;
  video_url?: string;
  caption?: string;
  stickers?: Array<{
    type: 'mention' | 'hashtag' | 'location';
    text: string;
    x: number;
    y: number;
  }>;
}

export interface InstagramInsights {
  reach: number;
  impressions: number;
  profile_views: number;
  website_clicks: number;
  email_contacts: number;
  phone_call_clicks: number;
  text_message_clicks: number;
  get_directions_clicks: number;
  follower_count: number;
}

export interface MediaInsights {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  video_views?: number;
  profile_visits?: number;
}

export const instagramService = {
  // Récupérer les informations d'un compte Instagram
  async getAccountInfo(accountId: number): Promise<InstagramAccount> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/info`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations du compte');
    }
    return response.json();
  },

  // Récupérer les médias d'un compte Instagram
  async getAccountMedia(accountId: number, limit: number = 25): Promise<InstagramMedia[]> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/media?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des médias');
    }
    return response.json();
  },

  // Publier une photo/vidéo sur Instagram
  async publishMedia(accountId: number, mediaData: PublishMediaRequest): Promise<{ id: string; permalink: string }> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(mediaData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la publication');
    }
    return response.json();
  },

  // Publier une story sur Instagram
  async publishStory(accountId: number, storyData: PublishStoryRequest): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(storyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la publication de la story');
    }
    return response.json();
  },

  // Publier un carrousel (plusieurs images/vidéos)
  async publishCarousel(accountId: number, mediaUrls: string[], caption?: string): Promise<{ id: string; permalink: string }> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/carousel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({
        media_urls: mediaUrls,
        caption,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la publication du carrousel');
    }
    return response.json();
  },

  // Récupérer les insights d'un compte
  async getAccountInsights(accountId: number, period: 'day' | 'week' | 'days_28' = 'week'): Promise<InstagramInsights> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/insights?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des insights');
    }
    return response.json();
  },

  // Récupérer les insights d'un média spécifique
  async getMediaInsights(accountId: number, mediaId: string): Promise<MediaInsights> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/media/${mediaId}/insights`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des insights du média');
    }
    return response.json();
  },

  // Supprimer un média Instagram
  async deleteMedia(accountId: number, mediaId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du média');
    }
  },

  // Récupérer les commentaires d'un média
  async getMediaComments(accountId: number, mediaId: string): Promise<Array<{
    id: string;
    text: string;
    username: string;
    timestamp: string;
    like_count: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/media/${mediaId}/comments`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commentaires');
    }
    return response.json();
  },

  // Répondre à un commentaire
  async replyToComment(accountId: number, commentId: string, message: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la réponse au commentaire');
    }
    return response.json();
  },

  // Masquer/supprimer un commentaire
  async hideComment(accountId: number, commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/comments/${commentId}/hide`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du masquage du commentaire');
    }
  },

  // Programmer une publication
  async schedulePost(accountId: number, mediaData: PublishMediaRequest, scheduledTime: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({
        ...mediaData,
        scheduled_publish_time: scheduledTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la programmation');
    }
    return response.json();
  },

  // Récupérer les publications programmées
  async getScheduledPosts(accountId: number): Promise<Array<{
    id: string;
    scheduled_publish_time: string;
    creation_id: string;
    status: 'SCHEDULED' | 'PUBLISHED' | 'ERROR';
  }>> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/scheduled`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des publications programmées');
    }
    return response.json();
  },

  // Annuler une publication programmée
  async cancelScheduledPost(accountId: number, creationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/instagram/accounts/${accountId}/scheduled/${creationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'annulation de la publication programmée');
    }
  },

  // Récupérer le token d'authentification
  getToken(): string | null {
    return localStorage.getItem('token');

  },
};