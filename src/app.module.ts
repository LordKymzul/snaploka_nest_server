import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config as loadEnv } from 'dotenv';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { ModulesModule } from './modules/modules.module';

loadEnv({ path: '.env' });

@Module({
  imports: [
    // BullModule.forRootAsync({
    //   inject: [Config],
    //   useFactory: (config: Config) => ({
    //     connection: {
    //       url: config.getRedisConfig().url,
    //     },
    //     defaultJobOptions: {
    //       attempts: 3,
    //     },
    //   }),
    // }),
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   inject: [Config],
    //   useFactory: (config: Config) => ({
    //     stores: [createKeyv(config.getRedisConfig().url)],
    //   }),
    // }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `environment/.env.${process.env.NODE_ENV}`,
    }),
    CoreModule,
    ModulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
