import { StableDiffusionResponse } from '../types';

export class StableDiffusionService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.STABLE_DIFFUSION_API_URL || "http://37.71.78.131:7860";
    }

    async txt2img(params: {
        prompt: string;
        negative_prompt?: string;
        width?: number;
        height?: number;
        steps?: number;
        denoising_strength?: number;
        init_images?: string[]; // AJOUT MANQUANT
        seed?: number;
        type?: string;
    }): Promise<StableDiffusionResponse> {
        const requestBody: any = {
            prompt: params.prompt,
            negative_prompt: params.negative_prompt || '',
            width: params.width || 512,
            height: params.height || 512,
            steps: params.steps || 20,
            cfg_scale: 7,
            sampler_index: "Euler a",
            seed: params.seed || -1
        };

        // Si des init_images sont fournies, c'est un img2img
        if (params.init_images && params.init_images.length > 0) {
            requestBody.init_images = params.init_images;
            requestBody.denoising_strength = params.denoising_strength || 0.75;
        }

        console.log(JSON.stringify(requestBody));

        const response = await fetch(`${this.baseUrl}/sdapi/v1/txt2img`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            // Timeout de 5 minutes pour la génération
            signal: AbortSignal.timeout(300000)
        });

        if (!response.ok) {
            throw new Error(`Stable Diffusion API error: ${response.statusText}`);
        }

        const result = await response.json() as StableDiffusionResponse;
        console.log('Params de génération : ' + JSON.stringify(params));
        
        // Vérifier si des images ont été générées
        if (!result.images || result.images.length === 0) {
            throw new Error('No images were generated');
        }

        return result;
    }

    async img2img(params: {
        prompt: string;
        negative_prompt?: string;
        width?: number;
        height?: number;
        steps?: number;
        denoising_strength?: number;
        cfg_scale?: number;
        sampler_index?: string;
        init_images?: string[];
        seed?: number;
    }): Promise<StableDiffusionResponse> {
        const response = await fetch(`${this.baseUrl}/sdapi/v1/img2img`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: params.prompt,
                negative_prompt: params.negative_prompt || '',
                width: params.width || 512,
                height: params.height || 512,
                steps: params.steps || 20,
                denoising_strength: params.denoising_strength || 0.75,
                init_images: params.init_images || [],
                cfg_scale: params.cfg_scale || 7,
                sampler_index: params.sampler_index || "Euler a",
                seed: params.seed || -1
            }),
            // Timeout de 5 minutes pour la génération
            signal: AbortSignal.timeout(300000)
        });

        if (!response.ok) {
            throw new Error(`Stable Diffusion API error: ${response.statusText}`);
        }

        const result = await response.json() as StableDiffusionResponse;
        
        // Vérifier si des images ont été générées
        if (!result.images || result.images.length === 0) {
            throw new Error('No images were generated');
        }

        return result;
    }
}