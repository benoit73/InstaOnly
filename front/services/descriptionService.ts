import { getAuthHeaders } from '../helper/authHelper';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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

    return response.json();
  }

}

export const descriptionService = new DescriptionService();