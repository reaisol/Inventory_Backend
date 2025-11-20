import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderItem,
  Product,
  Customer,
  User,
  Exchange,
  MetalPurity,
  MetalPrice,
  ProductStock,
} from '@app/database';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Customer,
      User,
      Exchange,
      MetalPurity,
      MetalPrice,
      ProductStock,
    ]),
    AuthenticationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
