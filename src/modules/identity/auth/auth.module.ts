import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { Config } from 'src/core/util/config';
import { AuthListener } from './auth.listener';
import { LoginAttemptService } from '../login_attempt/login_attempt.service';
import { LoginAttemptModule } from '../login_attempt/login_attempt.module';
import { AdminModule } from '../admin/admin.module';
import { FirebaseModule } from 'src/core/shared/firebase/firebase.module';
import { AuthProviderModule } from '../auth_provider/auth_provider.module';

@Module({
  imports: [
    LoginAttemptModule,
    JwtModule.register({}),
    UserModule,
    DbappModule,
    AdminModule,
    FirebaseModule,
    AuthProviderModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthListener, Config],
  exports: [AuthService],
})
export class AuthModule { }
