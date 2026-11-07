import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventPackageService } from './event_package.service';
import { EventPackageController } from './event_package.controller';
import { EventPackageRepository } from './event_package.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { RequestMethod } from '@nestjs/common';

@Module({
  imports: [DbappModule],
  controllers: [EventPackageController],
  providers: [EventPackageService, EventPackageRepository, Config],
  exports: [EventPackageService, EventPackageRepository],
})
export class EventPackageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtProtectedMiddleware)
      .exclude(
        { path: 'event-packages/simple', method: RequestMethod.GET }
      )
      .forRoutes(EventPackageController);
  }
}
