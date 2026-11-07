import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EventNoteService } from './event_note.service';
import { EventNoteController } from './event_note.controller';
import { EventNoteRepository } from './event_note.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { EventRepository } from '../event/event.repository';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';

@Module({
  imports: [DbappModule, FirebaseModule],
  controllers: [EventNoteController],
  providers: [
    EventNoteService,
    EventNoteRepository,
    EventRepository,
    Config,
  ],
  exports: [EventNoteService, EventNoteRepository],
})
export class EventNoteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtProtectedMiddleware)
      .forRoutes(
        { path: 'event-note', method: RequestMethod.GET },
        { path: 'event-note/:id', method: RequestMethod.PATCH },
        { path: 'event-note/:id', method: RequestMethod.DELETE },
      );

  }
}
