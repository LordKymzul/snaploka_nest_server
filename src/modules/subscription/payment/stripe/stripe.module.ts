import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { EventPackageModule } from '../../event_package/event_package.module';
import { EventModule } from 'src/modules/engagement/event/event.module';
import { OrderModule } from '../../order/order.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';

@Module({
  imports: [
    DbappModule,
    EventPackageModule,
    EventModule,
    OrderModule,
  ],
  controllers: [StripeController],
  providers: [StripeService, Config],
  exports: [StripeService],
})
export class StripeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //only exclude the webhook route
    consumer.apply(JwtProtectedMiddleware).exclude({
      path: '/stripe/webhook',
      method: RequestMethod.POST,
    }).forRoutes(StripeController);
  }
}
