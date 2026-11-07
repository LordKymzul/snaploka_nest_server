import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEventBankAccountDto } from './create-event_bank_account.dto';

export class UpdateEventBankAccountDto extends PartialType(CreateEventBankAccountDto) {
    @ApiProperty({
        description: 'Whether the bank account is active',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
