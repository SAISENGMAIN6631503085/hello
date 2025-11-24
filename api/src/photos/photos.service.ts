import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { AiService } from '../ai/ai.service';
import { SearchService } from '../search/search.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhotosService {
    private readonly logger = new Logger(PhotosService.name);

    constructor(
        private prisma: PrismaService,
        private minioService: MinioService,
        private aiService: AiService,
        private searchService: SearchService,
    ) { }

    create(data: Prisma.PhotoCreateInput) {
        return this.prisma.photo.create({ data });
    }

    findAll() {
        return this.prisma.photo.findMany();
    }

    async uploadAndProcessPhoto(file: Express.Multer.File, eventId: string) {
        this.logger.log(`Processing photo upload for event ${eventId}`);

        // 1. Upload to MinIO
        const storageUrl = await this.minioService.uploadFile(
            file.originalname,
            file.buffer,
            file.mimetype,
        );

        // 2. Create Photo record
        const photo = await this.prisma.photo.create({
            data: {
                eventId,
                storageUrl,
                mimeType: file.mimetype,
                processingStatus: 'PROCESSING',
            },
        });

        try {
            // 3. Detect faces with AI
            const faces = await this.aiService.extractFaces(file.buffer);
            this.logger.log(`Detected ${faces.length} faces in photo ${photo.id}`);

            // 4. Save each face to DB and Weaviate
            for (const faceData of faces) {
                // Save to Weaviate first
                const weaviateId = await this.searchService.addFace(
                    faceData.embedding,
                    photo.id,
                    eventId,
                );

                // Save to Postgres
                await this.prisma.face.create({
                    data: {
                        photoId: photo.id,
                        weaviateId,
                        confidence: faceData.det_score,
                        x: faceData.bbox[0],
                        y: faceData.bbox[1],
                        w: faceData.bbox[2] - faceData.bbox[0],
                        h: faceData.bbox[3] - faceData.bbox[1],
                    },
                });
            }

            // 5. Update photo status
            await this.prisma.photo.update({
                where: { id: photo.id },
                data: { processingStatus: 'COMPLETED' },
            });

            return {
                photoId: photo.id,
                storageUrl,
                facesDetected: faces.length,
                status: 'success',
            };
        } catch (error) {
            this.logger.error(`Error processing photo ${photo.id}:`, error);

            // Mark as failed
            await this.prisma.photo.update({
                where: { id: photo.id },
                data: { processingStatus: 'FAILED' },
            });

            throw error;
        }
    }
}
