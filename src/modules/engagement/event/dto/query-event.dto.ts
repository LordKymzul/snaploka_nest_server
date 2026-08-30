import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EVENT_STATUS, EVENT_TYPE, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryEventDto {

    @ApiProperty({
        description: `The type of the event ${Object.values(EVENT_TYPE).join(', ')}`,
        required: false,
        enum: Object.values(EVENT_TYPE),
    })
    @IsEnum(EVENT_TYPE)
    @IsOptional()
    type?: EVENT_TYPE;

    @ApiProperty({
        description: `The status of the event ${Object.values(EVENT_STATUS).join(', ')}`,
        required: false,
        enum: Object.values(EVENT_STATUS),
    })
    @IsEnum(EVENT_STATUS)
    @IsOptional()
    status?: EVENT_STATUS;


    @ApiProperty({
        description: 'The keyword to search for',
        required: false,
    })
    @IsString()
    @IsOptional()
    keyword?: string;


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

