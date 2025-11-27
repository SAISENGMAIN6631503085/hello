import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RemovalRequest {
    id: string;
    photoId: string;
    requestType: string;
    userName: string;
    reason?: string;
    createdAt: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// In-memory storage (for demo purposes)
const removalRequests: RemovalRequest[] = [];

@Controller('removal-requests')
export class RemovalRequestsController {
    constructor(private prisma: PrismaService) { }

    @Post()
    async create(@Body() data: { photoId: string; requestType: string; userName: string; reason?: string }) {
        const request: RemovalRequest = {
            id: `req_${Date.now()}`,
            photoId: data.photoId,
            requestType: data.requestType,
            userName: data.userName,
            reason: data.reason,
            createdAt: new Date(),
            status: 'PENDING',
        };

        removalRequests.push(request);
        console.log('Removal request received:', request);

        return {
            message: 'Removal request submitted successfully',
            requestId: request.id,
        };
    }

    @Get()
    async findAll() {
        // Fetch photo details for each request
        const requestsWithPhotos = await Promise.all(
            removalRequests.map(async (req) => {
                const photo = await this.prisma.photo.findUnique({
                    where: { id: req.photoId },
                    include: { event: true },
                });

                return {
                    ...req,
                    photo: photo ? {
                        id: photo.id,
                        url: photo.storageUrl,
                        eventName: photo.event.name,
                    } : null,
                };
            })
        );

        return requestsWithPhotos;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const index = removalRequests.findIndex(req => req.id === id);
        if (index !== -1) {
            removalRequests.splice(index, 1);
            return { message: 'Request deleted successfully' };
        }
        return { message: 'Request not found' };
    }
}
