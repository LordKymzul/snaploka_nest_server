import { Body, Controller, Post, Req, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { handleError } from 'src/core/util/helper';
import { RequestWithUser } from 'src/core/util/interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly appLoggerService: AppLoggerService,
  ) { }



  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body(ValidationPipe) createCheckoutSessionDto: CreateCheckoutSessionDto,
    @Req() req: RequestWithUser) {
    try {
      const result = await this.paymentService.createCheckoutSession(createCheckoutSessionDto, req.user.id);
      return {
        success: true,
        message: 'Checkout session created successfully',
        data: {
          url: result.url,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${PaymentController.name} - ${this.createCheckoutSession.name}`);
    }
  }
}
