import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { Config } from 'src/core/util/config';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { UserRepository } from 'src/modules/identity/user/user.repository';
import { EventPackageRepository } from '../event_package/event_package.repository';
import { EventRepository } from 'src/modules/engagement/event/event.repository';

@Module({
  imports: [DbappModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    Config,
    UserRepository,
    EventPackageRepository,
    EventRepository,
  ],
  exports: [OrderService, OrderRepository],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtProtectedMiddleware)
      .forRoutes(OrderController);
  }
}
