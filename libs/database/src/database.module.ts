import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USERNAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      database: process.env.DB_NAME,
      synchronize: false,
      logging: false,
      autoLoadEntities: true,
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    }),
  ],
})
export class DatabaseModule {}
