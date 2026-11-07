import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { UserRepository } from './user.repository';
import { AuthProviderModule } from '../auth_provider/auth_provider.module';
import { AdminModule } from '../admin/admin.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [DbappModule, AuthProviderModule, AdminModule, RoleModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule { }
