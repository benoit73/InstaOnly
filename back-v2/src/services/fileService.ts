import fs from 'fs';
import path from 'path';

export class FileService {
    static async saveImageFromBase64(
        base64Image: string,
        userId: number,
        accountId?: number,
        filename?: string
    ): Promise<string> {
        let uploadPath: string;
        if (accountId) {
            uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, `account_${accountId}`);
        } else {
            uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, 'global');
        }
        
        // Créer le dossier s'il n'existe pas
        fs.mkdirSync(uploadPath, { recursive: true });
        
        const finalFilename = filename || `image_${Date.now()}.png`;
        const filePath = path.join(uploadPath, finalFilename);
        
        // Convertir base64 en buffer et sauvegarder
        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(filePath, imageBuffer);
        
        return filePath;
    }

    static createDirectory(userId: number, accountId?: number): string {
        let uploadPath: string;
        if (accountId) {
            uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, `account_${accountId}`);
        } else {
            uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, 'global');
        }
        
        fs.mkdirSync(uploadPath, { recursive: true });
        return uploadPath;
    }
}