import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AUTH_PROVIDER, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class QueryAuthProviderDto {

    @ApiProperty({
        description: 'The name of the auth provider',
        required: false,
        enum: Object.values(AUTH_PROVIDER),
    })
    @IsString()
    @IsOptional()
    name?: string;


    @ApiProperty({
        description: 'The active status of the auth provider',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    is_active?: 'true' | 'false' = 'true';


    @ApiProperty({
        description: 'The limit of the auth providers',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the auth providers',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;
}

