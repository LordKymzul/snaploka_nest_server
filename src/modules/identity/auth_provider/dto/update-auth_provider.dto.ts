import { PartialType } from '@nestjs/swagger';
import { CreateAuthProviderDto } from './create-auth_provider.dto';

export class UpdateAuthProviderDto extends PartialType(CreateAuthProviderDto) { }
