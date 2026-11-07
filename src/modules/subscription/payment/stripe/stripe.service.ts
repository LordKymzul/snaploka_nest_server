import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Config } from 'src/core/util/config';
import * as Stripe from 'stripe';

import { EventRepository } from 'src/modules/engagement/event/event.repository';
import { ORDER_PAYMENT_PROVIDER, ORDER_STATUS } from 'src/core/util/constant';
import { CreateStripeCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import { EventPackageRepository } from '../../event_package/event_package.repository';
import { OrderService } from '../../order/order.service';
import { CreateOrderDto } from '../../order/dto/create-order.dto';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { OrderEntity } from '../../order/entities/order.entity';

@Injectable()
export class StripeService {

    private readonly logger = new Logger(StripeService.name);

    private stripe: Stripe;
    constructor(private readonly config: Config, private readonly packageRepository: EventPackageRepository, private readonly eventRepository: EventRepository, private readonly orderService: OrderService, private readonly appLogger: AppLoggerService) {
        this.stripe = new Stripe(this.config.getStripeConfig().secretKey, {
            apiVersion: '2026-08-26.dahlia',
        });
    }

    getStripe() {
        return this.stripe;
    }

    async createCheckoutSession(createCheckoutSessionDto: CreateStripeCheckoutSessionDto, user_id: string) {
        const {
            event_id,
            package_id
        } = createCheckoutSessionDto;

        const [
            eventPackage,
            event
        ] = await Promise.all([
            this.packageRepository.findOneByGuid(package_id),
            this.eventRepository.findOneByGuid(event_id),
        ]);

        if (!eventPackage) {
            throw new NotFoundException('Package not found');
        }

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        let order: OrderEntity | null = null;
        order = await this.orderService.findOneByEventIdAndUserId(event_id, user_id);
        this.logger.log(`Order found: ${order ? 'Yes' : 'No'}`, `${StripeService.name} - ${this.createCheckoutSession.name}`);
        if (!order) {
            let createdOrderDto: CreateOrderDto = {
                event_id: event_id,
                package_id: package_id,
                amount: eventPackage.price,
                currency: eventPackage.currency,
                max_media_allowed: eventPackage.max_media_count,
                max_storage_bytes: eventPackage.max_media_size,
                payment_provider: ORDER_PAYMENT_PROVIDER.STRIPE,
                status: ORDER_STATUS.PENDING,
                package_name: eventPackage.name,
                metadata: {
                    event_id: event_id,
                    package_id: package_id,
                },
            };

            const createdOrder = await this.orderService.create(createdOrderDto, user_id);
            order = createdOrder;
        }

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['fpx', 'card'],
            currency: eventPackage.currency.toLowerCase(),
            line_items: [
                {
                    price_data: {
                        currency: eventPackage.currency.toLowerCase(),
                        product_data: {
                            name: eventPackage.name,
                            description: eventPackage.description || undefined,
                        },
                        unit_amount: eventPackage.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `https://snaploka.com/dashboard/events/${event_id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://snaploka.com/dashboard/events/${event_id}?cancelled=true`,
            metadata: {
                order_id: order.id.toString(),
                event_id: event_id.toString(),
                user_id: user_id.toString(),
            },
        });


        if (!session.url) {
            throw new Error('Failed to create checkout session');
        }

        await this.orderService.update(order.id, {
            provider_order_id: session.id,
            payment_url: session.url,

        });
        return {
            url: session.url,
        };

    }

    async handleWebhook(event: Stripe.Event) {
        switch (event.type) {
            case 'checkout.session.completed':
                this.appLogger.info(`Stripe checkout session completed: ${event.id}`, { event }, `${StripeService.name} - ${this.handleCheckoutSessionCompleted.name}`);
                return this.handleCheckoutSessionCompleted(event);
            default:
                this.appLogger.info(`Unhandled Stripe event type: ${event.type}`, { eventId: event.id }, `${StripeService.name} - ${this.handleWebhook.name}`);
                return;
        }
    }

    private async handleCheckoutSessionCompleted(event: Stripe.Event) {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const eventId = session.metadata?.event_id;
        const providerPaymentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!orderId || !eventId) {
            this.appLogger.error(`Stripe checkout session completed: ${event.id} but order_id or event_id is missing from metadata`, `${StripeService.name} - ${this.handleCheckoutSessionCompleted.name}`);
            return;
        }

        const updatedOrder = await this.orderService.markAsPaid(orderId, eventId, providerPaymentId);
        this.appLogger.info(`Stripe checkout session completed: ${event.id} and order marked as paid`, { updatedOrder }, `${StripeService.name} - ${this.handleCheckoutSessionCompleted.name}`);
        return updatedOrder;
    }
}
