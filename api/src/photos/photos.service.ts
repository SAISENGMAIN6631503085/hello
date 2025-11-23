import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhotosService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.PhotoCreateInput) {
        return this.prisma.photo.create({ data });
    }

    findAll() {
        return this.prisma.photo.findMany();
    }
}
