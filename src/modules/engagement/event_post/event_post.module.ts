import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventPostService } from './event_post.service';
import { EventPostController } from './event_post.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';
import { Config } from 'src/core/util/config';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { EventPostRepository } from './event_post.repository';
import { EventModule } from '../event/event.module';
import { EventPostStorageService } from './event_post_storage.service';

@Module({
  imports: [
    DbappModule,
    FirebaseModule,
    EventModule
  ],
  controllers: [EventPostController],
  providers: [
    Config,
    EventPostService,
    EventPostRepository,
    EventPostStorageService
  ],
  exports: [
    EventPostService,
  
  ],
})
export class EventPostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(EventPostController);
  }
}
