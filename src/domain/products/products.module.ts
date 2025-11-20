import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product,
  MetalType,
  MetalPurity,
  Category,
  SystemSettings,
} from '@app/database';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuthenticationModule } from '@app/authentication';
import { MetalsModule } from '../metals/metals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      MetalType,
      MetalPurity,
      Category,
      SystemSettings,
    ]),
    AuthenticationModule,
    MetalsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
