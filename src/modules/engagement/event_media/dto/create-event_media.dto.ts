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


export class CreateEventMediaDto {
    @ApiProperty({
        description: 'The guest name of the media',
        example: 'Anonymous Guest',
        required: false,
    })
    @IsString()
    @IsOptional()
    guest_name?: string;

    @ApiProperty({
        description: `The status of the media ${Object.values(EVENT_MEDIA_STATUS).join(', ')}`,
        example: EVENT_MEDIA_STATUS.PENDING,
        required: true,
    })
    @IsEnum(EVENT_MEDIA_STATUS)
    @IsNotEmpty()
    status: EVENT_MEDIA_STATUS;

    @ApiProperty({
        description: 'The mime type of the media',
        example: 'image/jpeg',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    mime_type: string;

    @ApiProperty({
        description: 'The storage key of the media',
        example: 'events/evt_101/f9b32c-photo.jpg',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    storage_key: string;

    @ApiProperty({
        description: 'The thumbnail key of the media',
        example: 'events/evt_101/thumb_f9b32c-photo.webp',
        required: false,
    })
    @IsString()
    @IsOptional()
    thumbnail_key?: string;

    @ApiProperty({
        description: 'The file size of the media',
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    file_size_bytes: number;

    @ApiProperty({
        description: 'The metadata of the media',
        example: JSON.stringify({
            description: 'This is a wedding event for Hakim and Alya',
        }),
        required: false,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'The event id of the media',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;
}


