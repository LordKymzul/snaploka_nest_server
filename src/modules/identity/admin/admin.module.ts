import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { AdminRepository } from './admin.repository';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';

@Module({
  imports: [DbappModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, Config],
  exports: [AdminService, AdminRepository],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(AdminController);
  }
}
