export interface LlavaDescriptionParams {
  image: string; // Base64 encoded image
  prompt?: string; // Prompt personnalisé, sinon utilise un prompt par défaut
}

export class LlavaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.LLAVA_API_URL || "http://37.71.78.131:11435";
  }

  async generateDescription(params: LlavaDescriptionParams): Promise<LlavaResponse> {
    try {
      const {
        image,
        prompt = "Create a short and engaging Instagram post description based on this photo. Keep it generic and appealing to a wide audience"
      } = params;

      if (!image) {
        throw new Error('Image is required');
      }

      console.log(`Starting LLaVA description generation with prompt: "${prompt}"`);

      const requestBody = {
        model: "llava-v1.6-mistral-7b",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
            ]
          }
        ]
      };

      console.log('LLaVA request body:', JSON.stringify({
        ...requestBody,
        messages: [{
          ...requestBody.messages[0],
          content: [
            requestBody.messages[0].content[0],
            { type: "image_url", image_url: { url: `[Base64 image data - ${image.length} chars]` } }
          ]
        }]
      }));

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Timeout de 2 minutes pour la génération de description
        signal: AbortSignal.timeout(120000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLaVA API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as LlavaResponse;
      
      console.log('LLaVA description generated successfully');
      
      // Vérifier si une description a été générée
      if (!result.choices || !result.choices[0]?.message?.content) {
        throw new Error('No description was generated');
      }

      return result;
    } catch (error) {
      console.error('LLaVA generation error:', error);
      throw new Error(`Failed to generate description: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Vérifier si l'API LLaVA est disponible
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch (error) {
      console.error('LLaVA health check failed:', error);
      return false;
    }
  }
}

// Interface pour la réponse de l'API chat completions
export interface LlavaResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}