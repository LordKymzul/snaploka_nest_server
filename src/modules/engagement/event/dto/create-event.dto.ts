import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsOptional,
    IsEnum,
    IsObject,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EVENT_TYPE } from 'src/core/util/constant';

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
}



