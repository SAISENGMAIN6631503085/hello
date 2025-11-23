import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.EventCreateInput) {
        return this.prisma.event.create({ data });
    }

    findAll() {
        return this.prisma.event.findMany();
    }

    findOne(id: string) {
        return this.prisma.event.findUnique({ where: { id } });
    }
}
