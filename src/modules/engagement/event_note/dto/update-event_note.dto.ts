import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventNoteDto } from './create-event_note.dto';
import { EVENT_NOTE_STATUS } from 'src/core/util/constant';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateEventNoteDto extends PartialType(CreateEventNoteDto) {
    @ApiProperty({
        description: `The status of the note ${Object.values(EVENT_NOTE_STATUS).join(', ')}`,
        example: EVENT_NOTE_STATUS.PUBLISHED,
        required: false,
        enum: Object.values(EVENT_NOTE_STATUS),
    })
    @IsEnum(EVENT_NOTE_STATUS)
    @IsOptional()
    status?: EVENT_NOTE_STATUS;
}
