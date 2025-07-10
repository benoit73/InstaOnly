import { getAuthHeaders } from '../helper/authHelper';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type GenerateDescriptionResponse = {
  success: boolean;
  data: {
    imageId: number;
    description: string;
    model?: string;
    usage?: any;
    image?: {
      id: number;
      filename: string;
      prompt?: string;
    };
  };
};

class DescriptionService {
  // Générer une description pour une image
  async generateDescription(imageId: number): Promise<{ description: string }> {
    const url = `${NEXT_PUBLIC_BACKEND_URL}/description/generate?imageId=${imageId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la description');
    }

    const result: GenerateDescriptionResponse = await response.json();

    // On récupère la description dans result.data.description
    if (result.success && result.data && result.data.description) {
      return { description: result.data.description };
    } else {
      throw new Error('Aucune description générée');
    }
  }
}

export const descriptionService = new DescriptionService();