import { Request, Response, NextFunction } from 'express';

// Middleware for logging requests
export const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// Middleware for validating request body for /generate route
export const validateGenerateRequest = (req: Request, res: Response, next: NextFunction) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'accountId and prompt are required' });
    }
    next();
};