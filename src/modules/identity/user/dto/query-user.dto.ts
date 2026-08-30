import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';



export class QueryUserDto {



    @ApiProperty({
        description: 'The keyword of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    keyword?: string;

    @ApiProperty({
        description: 'The active status of the user',
        required: false,
        enum: ['true', 'false'],
        example: 'true',
    })
    @IsString()
    @IsOptional()
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
}

