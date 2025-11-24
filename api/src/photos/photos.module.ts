import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { MinioModule } from '../minio/minio.module';
import { AiModule } from '../ai/ai.module';
import { SearchModule } from '../search/search.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MinioModule, AiModule, SearchModule, PrismaModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule { }
