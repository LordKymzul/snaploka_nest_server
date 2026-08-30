import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { EVENT_STATUS } from 'src/core/util/constant';
import {
    IsEnum,
    IsOptional
} from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
    @ApiProperty({
        description: 'The status of the event',
        example: EVENT_STATUS.ACTIVE,
        required: false,
    })
    @IsEnum(EVENT_STATUS)
    @IsOptional()
    status?: EVENT_STATUS;
}
