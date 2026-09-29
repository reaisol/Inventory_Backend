import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { Role } from '@app/database/entities/role.entity';
import { Order } from '@app/database/entities/order.entity';
import { DailySheet } from '@app/database/entities/daily-sheet.entity';
import { Expense } from '@app/database/entities/expense.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Order, DailySheet, Expense]),
    AuthenticationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
