import { Module } from '@nestjs/common';
import { LoggingModule } from './logging/logging.module';
import { DatabaseModule } from './database/database.module';
import { FirebaseModule } from './shared/firebase/firebase.module';

@Module({
  imports: [LoggingModule, DatabaseModule, FirebaseModule],
})
export class CoreModule {}
