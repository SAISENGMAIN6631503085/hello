import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { PhotosModule } from './photos/photos.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    PhotosModule,
    UsersModule,
    SearchModule,
    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
