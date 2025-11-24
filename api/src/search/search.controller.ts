import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchService } from './search.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('search')
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
        private readonly aiService: AiService,
        private readonly prismaService: PrismaService,
    ) { }

    @Post('face')
    @UseInterceptors(FileInterceptor('file'))
    async searchByFace(@UploadedFile() file: Express.Multer.File) {
        try {
            if (!file) {
                throw new BadRequestException('File is required');
            }

            console.log('1. File received:', file.originalname, file.size);

            // 1. Get embedding from AI Service
            const embeddings = await this.aiService.extractFaces(file.buffer);
            console.log('2. Embeddings extracted:', embeddings?.length);

            if (!embeddings || embeddings.length === 0) {
                return { message: 'No face detected', results: [] };
            }

            // 2. Search Weaviate with the first face found
            const vector = embeddings[0].embedding;
            console.log('3. Searching Weaviate with vector length:', vector?.length);

            const weaviateResults = await this.searchService.searchFaces(vector);
            console.log('4. Weaviate results:', JSON.stringify(weaviateResults, null, 2));

            // 3. Extract face data from Weaviate response
            const faces = weaviateResults?.data?.Get?.Face || [];
            console.log('5. Faces found:', faces.length);

            if (faces.length === 0) {
                return { message: 'No matches found', results: [] };
            }

            // 4. Get photo and event details from database
            const results = await Promise.all(
                faces.map(async (face: any) => {
                    console.log('6. Processing face:', face);

                    const photo = await this.prismaService.photo.findUnique({
                        where: { id: face.photoId },
                        include: { event: true },
                    });

                    console.log('7. Photo found:', photo?.id);

                    if (!photo) return null;

                    return {
                        id: photo.id,
                        url: photo.storageUrl,
                        eventName: photo.event.name,
                        eventDate: photo.event.date,
                        confidence: 1 - (face._additional?.distance || 0),
                    };
                })
            );

            console.log('8. Final results:', results.length);

            // Filter out nulls and return
            return {
                message: `Found ${results.filter(r => r !== null).length} matches`,
                results: results.filter(r => r !== null),
            };
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }
}
