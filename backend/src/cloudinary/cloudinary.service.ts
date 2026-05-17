import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const toStream = require('buffer-to-stream');
import { Multer } from 'multer';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream((error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
        });

        // Convertimos el buffer del archivo en un stream y lo enviamos
        toStream(file.buffer).pipe(upload);
        });
    }
}