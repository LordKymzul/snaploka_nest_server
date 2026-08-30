import { Module } from '@nestjs/common';
import { DbappModule } from './dbapp/dbapp.module';

@Module({
  imports: [DbappModule]
})
export class DatabaseModule {}
