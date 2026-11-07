import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsObject,
    IsNumber,
} from 'class-validator';
import { EVENT_MEDIA_STATUS } from 'src/core/util/constant';


export class PresignedUrlRequestDto {
    @ApiProperty({
        description: 'The guest name of the media',
        example: 'Anonymous Guest',
        required: false,
    })
    @IsString()
    @IsOptional()
    guest_name?: string;


    @ApiProperty({
        description: 'The mime type of the media',
        example: 'image/jpeg',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    mime_type: string;

    @ApiProperty({
        description: 'The file size of the media',
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    file_size_bytes: number;

    @ApiProperty({
        description: 'The event id of the media',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;
}


