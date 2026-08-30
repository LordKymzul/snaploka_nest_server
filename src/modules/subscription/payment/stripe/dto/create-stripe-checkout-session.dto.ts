import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty
} from 'class-validator';
import { CreateCheckoutSessionDto } from '../../dto/create-checkout-session.dto';
export class CreateStripeCheckoutSessionDto extends CreateCheckoutSessionDto {


    
}