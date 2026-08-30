import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { AuthProviderModule } from './auth_provider/auth_provider.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoginAttemptModule } from './login_attempt/login_attempt.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [RoleModule, AuthProviderModule, UserModule, AuthModule, LoginAttemptModule, AdminModule]
})
export class IdentityModule {}
