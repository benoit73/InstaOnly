import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    const userId = req.user?.id;
    const accountId = req.body.accountId;
    
    let uploadPath: string;
    if (accountId) {
      uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, `account_${accountId}`);
    } else {
      uploadPath = path.join(__dirname, '../../uploads', `user_${userId}`, 'global');
    }
    
    // Créer le dossier s'il n'existe pas
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `image_${timestamp}.png`;
    cb(null, filename);
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});