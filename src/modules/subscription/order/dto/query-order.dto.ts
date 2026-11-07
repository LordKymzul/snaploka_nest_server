import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
    ORDER_PAYMENT_PROVIDER,
    ORDER_STATUS,
    PAGINATION_LIMIT,
    PAGINATION_PAGE,
} from 'src/core/util/constant';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryOrderDto {
    @ApiProperty({
        description: 'Search by package name',
        required: false,
    })
    @IsString()
    @IsOptional()
    keyword?: string;

    @ApiProperty({
        description: `The status of the order ${Object.values(ORDER_STATUS).join(', ')}`,
        required: false,
        enum: Object.values(ORDER_STATUS),
    })
    @IsEnum(ORDER_STATUS)
    @IsOptional()
    status?: ORDER_STATUS;

    @ApiProperty({
        description: `The payment provider of the order ${Object.values(ORDER_PAYMENT_PROVIDER).join(', ')}`,
        required: false,
        enum: Object.values(ORDER_PAYMENT_PROVIDER),
    })
    @IsEnum(ORDER_PAYMENT_PROVIDER)
    @IsOptional()
    payment_provider?: ORDER_PAYMENT_PROVIDER;

    @ApiProperty({
        description: 'Whether to include the event in the response',
        required: false,
        example: 'false',
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    with_event?: 'true' | 'false' = 'false';

    @ApiProperty({
        description: 'Whether to include the user in the response',
        required: false,
        example: 'false',
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    with_user?: 'true' | 'false' = 'false';

    @ApiProperty({
        description: 'Whether to include the event package in the response',
        required: false,
        example: 'false',
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    with_event_package?: 'true' | 'false' = 'false';

    @ApiProperty({
        description: 'The limit of the orders',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the orders',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;
}
