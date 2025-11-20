import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '@app/database';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthenticationModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
