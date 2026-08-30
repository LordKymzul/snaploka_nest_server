import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';


export class QueryLoginAttemptDto {
    @ApiProperty({
        description: 'The keyword to search for',
        required: false,
    })
    @IsString()
    @IsOptional()
    keyword?: string;


    @ApiProperty({
        description: 'The user ID to search for',
        required: false,
    })
    @IsString()
    @IsOptional()
    user_id?: string;

    @ApiProperty({
        description: 'The is success of the login attempt',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    is_success?: 'true' | 'false';

    @ApiProperty({
        description: 'The limit of the login attempts',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the login attempts',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;


    @ApiProperty({
        description: 'Whether to include the user in the response',
        required: false,
        example: 'true',
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    with_user?: 'true' | 'false' = 'false';


}