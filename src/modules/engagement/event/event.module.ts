import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { UserRepository } from 'src/modules/identity/user/user.repository';
import { EventStorageService } from './event_storage.serviec';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';
import { EventBankAccountRepository } from '../event_bank_account/event_bank_account.repository';

@Module({
  imports: [
    DbappModule,
    FirebaseModule,
  ],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    Config,
    UserRepository,
    EventStorageService,

  ],
  exports: [EventService, EventRepository, EventStorageService],
})
export class EventModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(EventController);
  }
}
