import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventBankAccountService } from './event_bank_account.service';
import { EventBankAccountController } from './event_bank_account.controller';
import { EventModule } from '../event/event.module';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { EventBankAccountRepository } from './event_bank_account.repository';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { EventBankAccountStorageService } from './event_bank_account_storage.service';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';
import { EventRepository } from '../event/event.repository';

@Module({
  imports: [
    FirebaseModule,
    DbappModule
  ],
  controllers: [EventBankAccountController],
  providers: [EventBankAccountService, EventBankAccountRepository, Config, EventBankAccountStorageService, EventRepository],
  exports: [EventBankAccountService, EventBankAccountRepository, EventBankAccountStorageService],
})
export class EventBankAccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(EventBankAccountController);
  }
}
