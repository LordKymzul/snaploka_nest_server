import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsOptional,
    IsEnum,
    IsObject,
    MaxLength,
    IsNumber,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EVENT_ACCESS_MODE, EVENT_TYPE } from 'src/core/util/constant';
import { CreateEventBankAccountDto } from '../../event_bank_account/dto/create-event_bank_account.dto';

export class CreateEventDto {


    @ApiProperty({
        description: 'The name of the event',
        example: 'Hakim & Alya Wedding',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'The description of the event',
        example: 'This is a wedding event for Hakim and Alya',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: `The type of the event ${Object.values(EVENT_TYPE).join(', ')}`,
        example: EVENT_TYPE.WEDDING,
        required: true,
    })
    @IsEnum(EVENT_TYPE)
    @IsNotEmpty()
    type: EVENT_TYPE;


    @ApiProperty({
        description: 'The start date of the event',
        example: new Date(),
        required: true,
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    start_date: Date;

    @ApiProperty({
        description: 'The end date of the event',
        example: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        required: true,
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    end_date: Date;


    @ApiProperty({
        description: 'The metadata of the event',
        example: JSON.stringify({
            location: 'Kuala Lumpur, Malaysia',
            guests: 100,
        }),
        required: false,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;


    @ApiProperty({
        description: 'The access mode of the event',
        example: EVENT_ACCESS_MODE.READ_WRITE,
        required: true,
    })
    @IsEnum(EVENT_ACCESS_MODE)
    @IsOptional()
    access_mode?: EVENT_ACCESS_MODE;


    @ApiProperty({
        description: 'The mime type of the media',
        example: 'image/jpeg',
        required: true,
    })
    @IsString()
    @IsOptional()
    thumbnail_mime_type?: string;

    @ApiProperty({
        description: 'The file size of the media',
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsOptional()
    thumbnail_file_size?: number;


}



