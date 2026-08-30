import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Config } from 'src/core/util/config';
import * as Stripe from 'stripe';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { EventPackageRepository } from '../event_package/event_package.repository';
import { EventRepository } from 'src/modules/engagement/event/event.repository';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { ORDER_PAYMENT_PROVIDER, ORDER_STATUS } from 'src/core/util/constant';
import { OrderService } from '../order/order.service';
import { StripeService } from './stripe/stripe.service';

@Injectable()
export class PaymentService {


    constructor(private readonly stripeService: StripeService) { }


    async createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto, user_id: string) {
        switch (createCheckoutSessionDto.payment_provider) {
            case ORDER_PAYMENT_PROVIDER.STRIPE:
                return this.stripeService.createCheckoutSession(createCheckoutSessionDto, user_id);
            default:
                throw new BadRequestException('Invalid payment provider');
        }
    }
}
