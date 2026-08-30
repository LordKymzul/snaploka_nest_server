import { Module } from '@nestjs/common';
import { AuthProviderService } from './auth_provider.service';
import { AuthProviderController } from './auth_provider.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { AuthProviderRepository } from './auth_provider.repository';

@Module({
  imports: [DbappModule],
  controllers: [AuthProviderController],
  providers: [AuthProviderService, AuthProviderRepository],
  exports: [AuthProviderService, AuthProviderRepository],
})
export class AuthProviderModule { }
