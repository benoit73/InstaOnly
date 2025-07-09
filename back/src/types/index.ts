export interface GenerateRequest {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    denoising_strength?: number;
    init_images?: string[];
    accountId?: number;
    type?: string;
}

export interface StableDiffusionResponse {
    images: string[];
    parameters: any;
    info: string;
}

// Re-export des types utilisateur pour faciliter l'import
export { UserAttributes, AuthenticatedUser, AuthenticatedRequest } from './user';

// Override du module passport pour éviter les conflits de types
declare module 'passport' {
    interface AuthenticateOptions {
        session?: boolean;
    }
}