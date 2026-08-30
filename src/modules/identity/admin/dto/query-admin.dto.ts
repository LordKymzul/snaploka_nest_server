import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class QueryAdminDto {

    @ApiProperty({
        description: 'The user ID',
        required: false,
    })
    @IsOptional()
    @IsString()
    user_id?: string;

    @ApiProperty({
        description: 'The is_active',
        required: false,
        default: 'true',
        enum: ['true', 'false'],
    })
    @IsOptional()
    @IsString()
    is_active?: 'true' | 'false' = 'true';

    @ApiProperty({
        description: 'The limit of the users',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the users',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;


    @ApiProperty({
        description: 'The with_user',
        required: false,
        enum: ['true', 'false'],
        example: 'true',
    })
    @IsOptional()
    @IsString()
    with_user?: 'true' | 'false' = 'true';
}