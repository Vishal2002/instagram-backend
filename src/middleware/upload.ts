//upload.js
import express, {Request,Response} from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import multerS3 from 'multer-s3';
import {AWS} from '../service/service';
import { FileUpload } from '../config/uploadConfig';
dotenv.config();

const bucketName = process.env.BUCKET || 'your-default-bucket-name';
export const upload = multer({
  storage: multerS3({
    s3: AWS,
    bucket: bucketName,
    key: function (req:any, file:any, cb:any) {
      cb(null, `upload/instagram/post/${file.originalname}`);
    },
  }),
  fileFilter: function (req:any, file:any, cb:any) {

    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("File type does not support."));
    }
  },
});


