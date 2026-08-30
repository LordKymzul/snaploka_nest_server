import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PAGINATION_LIMIT, PAGINATION_PAGE, USER_ROLE } from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryRoleDto {

    @ApiProperty({
        description: 'The name of the role',
        required: false,
        enum: Object.values(USER_ROLE),
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'The active status of the role',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    is_active?: 'true' | 'false' = 'true';


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

