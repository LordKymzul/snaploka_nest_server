import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
    EVENT_MEDIA_STATUS,
    PAGINATION_LIMIT,
    PAGINATION_PAGE
} from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryEventMediaDto {


    @ApiProperty({
        description: 'The event id of the media',
        required: false,
    })
    @IsString()
    @IsOptional()
    event_id?: string;

    @ApiProperty({
        description: `The status of the media ${Object.values(EVENT_MEDIA_STATUS).join(', ')}`,
        required: false,
        enum: Object.values(EVENT_MEDIA_STATUS),
    })
    @IsEnum(EVENT_MEDIA_STATUS)
    @IsOptional()
    status?: EVENT_MEDIA_STATUS;


    @ApiProperty({
        description: 'The limit of the roles',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;


    @ApiProperty({
        description: 'The page of the roles',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;
}

