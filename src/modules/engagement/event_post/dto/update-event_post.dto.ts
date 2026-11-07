import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventPostAttachmentDto, CreateEventPostDto } from './create-event_post.dto';
import { EVENT_ATTACHMENT_STATUS } from '../../../../core/util/constant';
import {
    IsEnum,
    IsOptional
} from 'class-validator';

export class UpdateEventPostDto extends PartialType(CreateEventPostDto) { }


export class UpdateEventPostAttachmentDto extends PartialType(CreateEventPostAttachmentDto) {
    @IsEnum(EVENT_ATTACHMENT_STATUS)
    @IsOptional()
    @ApiProperty({
        description: `The status of the attachment ${Object.values(EVENT_ATTACHMENT_STATUS).join(', ')}`,
        example: EVENT_ATTACHMENT_STATUS.PENDING,
        required: false,
    })
    status?: EVENT_ATTACHMENT_STATUS;
} 