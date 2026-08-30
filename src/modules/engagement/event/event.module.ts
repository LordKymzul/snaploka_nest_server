import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { UserRepository } from 'src/modules/identity/user/user.repository';

@Module({
  imports: [
    DbappModule,
  ],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    Config,
    UserRepository,
  ],
  exports: [EventService, EventRepository],
})
export class EventModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(EventController);
  }
}
