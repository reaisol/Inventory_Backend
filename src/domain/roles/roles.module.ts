import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@app/database/entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), AuthenticationModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
