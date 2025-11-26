import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { Prisma } from '@prisma/client';

@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) { }

    @Post()
    create(@Body() data: Prisma.PhotoCreateInput) {
        return this.photosService.create(data);
    }

    @Get()
    findAll() {
        return this.photosService.findAll();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPhoto(
        @UploadedFile() file: Express.Multer.File,
        @Body('eventId') eventId: string,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }

        return this.photosService.uploadAndProcessPhoto(file, eventId);
    }

    @Delete(':id')
    async deletePhoto(@Param('id') id: string) {
        return this.photosService.deletePhoto(id);
    }
}
