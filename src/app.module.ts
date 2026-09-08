import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule } from '@app/authentication';
import { DatabaseModule } from '@app/database';
import { validateEnvironment } from './config/environment';
import { HealthModule } from './health/health.module';
import {
  AuthModule,
  UsersModule,
  RolesModule,
  CustomersModule,
  MetalsModule,
  CategoriesModule,
  ProductsModule,
  OrdersModule,
  SettingsModule,
  DashboardModule,
  ExpensesModule,
  DailySheetsModule,
  ChatbotModule,
} from './domain';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    DatabaseModule,
    AuthenticationModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MetalsModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    SettingsModule,
    DashboardModule,
    ExpensesModule,
    DailySheetsModule,
    ChatbotModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
