import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
