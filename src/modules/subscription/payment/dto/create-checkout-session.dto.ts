import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty, IsUUID,
    IsEnum
} from 'class-validator';
import { ORDER_PAYMENT_PROVIDER } from 'src/core/util/constant';
export class CreateCheckoutSessionDto {


    @ApiProperty({
        description: 'The ID of the event',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;

    @ApiProperty({
        description: 'The ID of the package',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    package_id: string;


    @ApiProperty({
        description: 'The payment provider',
        required: true,
    })
    @IsEnum(ORDER_PAYMENT_PROVIDER)
    @IsNotEmpty()
    payment_provider: ORDER_PAYMENT_PROVIDER;
}