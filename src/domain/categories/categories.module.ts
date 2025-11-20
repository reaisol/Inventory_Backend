import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@app/database';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthenticationModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
