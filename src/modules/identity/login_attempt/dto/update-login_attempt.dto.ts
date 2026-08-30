import { PartialType } from '@nestjs/swagger';
import { CreateLoginAttemptDto } from './create-login_attempt.dto';

export class UpdateLoginAttemptDto extends PartialType(CreateLoginAttemptDto) {}
