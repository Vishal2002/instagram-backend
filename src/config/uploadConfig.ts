import { Request } from 'express';

export interface FileUpload extends Request {
  file: Express.Multer.File;
  
}