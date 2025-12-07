import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export class UploadController {
  uploadImage = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      // In production, you would upload to S3/Cloudinary and return the URL
      // For now, we'll return a relative path
      const fileUrl = `/uploads/${req.file.filename}`;
      
      sendSuccess(res, { url: fileUrl, filename: req.file.filename }, 'File uploaded successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Upload failed', 500);
    }
  };
}

