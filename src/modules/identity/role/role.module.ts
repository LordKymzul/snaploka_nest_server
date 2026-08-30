import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { RoleRepository } from './role.repository';

@Module({
  imports: [DbappModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule { }
