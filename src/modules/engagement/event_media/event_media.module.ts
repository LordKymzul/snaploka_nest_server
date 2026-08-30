import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventMediaService } from './event_media.service';
import { EventMediaController } from './event_media.controller';
import { EventMediaRepository } from './event_media.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { EventRepository } from '../event/event.repository';
import { EventMediaStorageService } from './event_media_storage.service';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';

@Module({
  imports: [
    DbappModule,
    FirebaseModule
  ],
  controllers: [EventMediaController],
  providers: [
    EventMediaService,
    EventMediaRepository,
    Config,
    EventRepository,
    EventMediaStorageService,
  ],
  exports: [EventMediaService, EventMediaRepository],
})
export class EventMediaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtProtectedMiddleware)
      .forRoutes(EventMediaController);
  }
}
