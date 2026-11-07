import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsNotEmpty
} from 'class-validator';

export class CreateEventNoteDto {
    @ApiProperty({
        description: 'The guest name of the note',
        example: 'Anonymous Guest',
        required: false,
    })
    @IsString()
    @IsOptional()
    guest_name?: string;


    @ApiProperty({
        description: 'The title of the note',
        example: 'My Note',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;
    
    @ApiProperty({
        description: 'The content of the note',
        example: 'This is my note content',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'The event id of the note',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;

}


