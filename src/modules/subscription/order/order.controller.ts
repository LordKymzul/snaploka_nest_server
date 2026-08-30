import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpStatus,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { authorizeUserOrAdmin, getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { RequestWithUser } from 'src/core/util/interface';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Finance - Orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly orderService: OrderService,
  ) { }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const order = await this.orderService.create(createOrderDto, user.id);
      return {
        message: 'Order created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          order,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.create.name}`);
    }
  }

  @Get('user/:user_id')
  async findAllByUserId(
    @Req() req: RequestWithUser,
    @Param('user_id') user_id: string,
    @Query(ValidationPipe) queryOrderDto: QueryOrderDto,
  ) {
    try {
      const { is_authorized, message } = authorizeUserOrAdmin(req, user_id);
      if (!is_authorized) {
        throw new UnauthorizedException(message);
      }

      const result = await this.orderService.findAllByUser(queryOrderDto, user_id);
      return {
        message: 'Orders fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          orders: result.orders,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.findAllByUserId.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryOrderDto: QueryOrderDto) {
    try {
      const result = await this.orderService.findAll(queryOrderDto);
      return {
        message: 'Orders fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          orders: result.orders,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const order = await this.orderService.findOne(id);
      return {
        message: 'Order fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          order,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ) {
    try {
      const order = await this.orderService.update(id, updateOrderDto);
      return {
        message: 'Order updated successfully',
        status_code: HttpStatus.OK,
        data: {
          order,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const order = await this.orderService.remove(id);
      return {
        message: 'Order deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          order,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${OrderController.name} - ${this.remove.name}`);
    }
  }
}
