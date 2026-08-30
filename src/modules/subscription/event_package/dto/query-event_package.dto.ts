import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { Transform } from 'class-transformer';

export class QueryEventPackageDto {
    @ApiProperty({
        description: 'The name of the event package',
        required: false,
    })
    @IsString()
    @IsOptional()
    keyword?: string;

    @ApiProperty({
        description: 'The active status of the event package',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    is_active?: 'true' | 'false';

    @ApiProperty({
        description: 'The limit of the event packages',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the event packages',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;
}
