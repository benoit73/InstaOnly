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