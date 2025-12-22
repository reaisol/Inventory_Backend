import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@app/authentication';
import { DatabaseModule } from '@app/database';
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
} from './domain';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
