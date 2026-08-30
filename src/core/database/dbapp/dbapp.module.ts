import { Module } from '@nestjs/common';
import { DbappService } from './dbapp.service';
import { DbappController } from './dbapp.controller';

@Module({
  controllers: [DbappController],
  providers: [DbappService],
  exports: [DbappService],
})
export class DbappModule {}

