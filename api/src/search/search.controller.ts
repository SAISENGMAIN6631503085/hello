import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post('face')
    async searchByFace(@Body() body: { vector: number[] }) {
        // In a real app, you'd upload an image here, and the backend would
        // send it to the AI service to get the vector.
        // For now, we accept a raw vector for testing.
        return this.searchService.searchFaces(body.vector);
    }
}

