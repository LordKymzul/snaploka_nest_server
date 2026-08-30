import { ApiProperty } from '@nestjs/swagger';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_PAYMENT_PROVIDER, ORDER_STATUS } from 'src/core/util/constant';

export class CreateOrderDto {
    @ApiProperty({
        description: 'The ID of the subscription package',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    package_id: string;

    @ApiProperty({
        description: 'The ID of the event',
        required: false,
    })
    @IsOptional()
    @IsString()
    event_id?: string;

    @ApiProperty({
        description: 'The name of the package',
        required: false,
    })
    @IsOptional()
    @IsString()
    package_name?: string;

    @ApiProperty({
        description: 'The amount of the order',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'The currency of the order',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'The max media allowed of the order',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    max_media_allowed: number;

    @ApiProperty({
        description: 'The max storage bytes of the order',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    max_storage_bytes: number;

    @ApiProperty({
        description: `The payment provider of the order ${Object.values(ORDER_PAYMENT_PROVIDER).join(', ')}`,
        required: true,
        enum: Object.values(ORDER_PAYMENT_PROVIDER),
        example: ORDER_PAYMENT_PROVIDER.STRIPE,
    })
    @IsNotEmpty()
    @IsEnum(ORDER_PAYMENT_PROVIDER)
    payment_provider: ORDER_PAYMENT_PROVIDER;

    @ApiProperty({
        description: 'The provider order ID of the order',
        required: false,
    })
    @IsOptional()
    @IsString()
    provider_order_id?: string;

    @ApiProperty({
        description: 'The provider payment ID of the order',
        required: false,
    })
    @IsOptional()
    @IsString()
    provider_payment_id?: string;

    @ApiProperty({
        description: 'The metadata of the order',
        required: false,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;



    @ApiProperty({
        description: 'The paid at of the order',
        required: false,
    })
    @ValidateIf((object, value) => object.status === ORDER_STATUS.PAID)
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    paid_at?: Date;

    @ApiProperty({
        description: 'The status of the order',
        required: true,
        example: ORDER_STATUS.PENDING,
        enum: Object.values(ORDER_STATUS),
    })
    @IsNotEmpty()
    @IsEnum(ORDER_STATUS)
    status: ORDER_STATUS;

    @ApiProperty({
        description: 'The payment URL of the order',
        required: false,
    })
    @IsOptional()
    @IsString()
    payment_url?: string;
}
