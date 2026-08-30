import {
  Controller,
  Req,
  Headers,
  BadRequestException,
  Post,
  InternalServerErrorException
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Config } from 'src/core/util/config';
import { Request } from 'express';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

@Controller('stripe')
export class StripeController {


  private readonly stripeWebhookSecret: string;


  constructor(
    private readonly stripeService: StripeService,
    private readonly config: Config,
    private readonly appLogger: AppLoggerService
  ) {
    this.stripeWebhookSecret = this.config.getStripeConfig().webhookSecret;
  }





  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') sig: string,
  ) {
    const signature = sig;
    if (!signature) {
      throw new BadRequestException('Stripe signature is required');
    }

    try {
      const event = this.stripeService.getStripe().webhooks.constructEvent(req.body, signature, this.stripeWebhookSecret);
      this.appLogger.info(`Stripe webhook received: ${event.type}`, { event }, `${StripeController.name} - ${this.handleWebhook.name}`);
      await this.stripeService.handleWebhook(event);
      return {
        received: true
      }
    } catch (error) {
      this.appLogger.error(`Stripe webhook error: ${error.message}`, `${StripeController.name} - ${this.handleWebhook.name}`);
      throw new InternalServerErrorException(`Invalid signature: ${error.message}`);
    }

  }
}
