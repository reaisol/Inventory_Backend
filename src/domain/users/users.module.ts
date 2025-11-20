import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { Role } from '@app/database/entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), AuthenticationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
