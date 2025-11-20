import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetalType, MetalPurity, MetalPrice } from '@app/database';
import { MetalsService } from './metals.service';
import { MetalsController } from './metals.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetalType, MetalPurity, MetalPrice]),
    AuthenticationModule,
  ],
  controllers: [MetalsController],
  providers: [MetalsService],
  exports: [MetalsService],
})
export class MetalsModule {}
