import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettings } from '@app/database';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings]), AuthenticationModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
