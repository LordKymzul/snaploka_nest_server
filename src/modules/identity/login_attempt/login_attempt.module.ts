import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoginAttemptService } from './login_attempt.service';
import { LoginAttemptController } from './login_attempt.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { Config } from 'src/core/util/config';
import { UserModule } from '../user/user.module';
import { LoginAttemptRepository } from './login_attempt.repository';
import { UserRepository } from '../user/user.repository';


@Module({
  imports: [DbappModule],
  controllers: [LoginAttemptController],
  providers: [LoginAttemptService, Config, LoginAttemptRepository, UserRepository],
  exports: [LoginAttemptService]
})
export class LoginAttemptModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(LoginAttemptController);
  }
}
