import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderItem,
  Product,
  Exchange,
  MetalType,
  MetalPurity,
  MetalPrice,
} from '@app/database';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Exchange,
      MetalType,
      MetalPurity,
      MetalPrice,
    ]),
    AuthenticationModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
