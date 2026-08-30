import { Controller } from '@nestjs/common';
import { DbappService } from './dbapp.service';

@Controller('dbapp')
export class DbappController {
  constructor(private readonly dbappService: DbappService) {}
}
