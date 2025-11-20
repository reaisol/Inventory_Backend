import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const port = process.env.APP_PORT || 3000;
  // enable cors
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Jewellery Inventory API')
    .setDescription(
      'API documentation for Jewellery Inventory Management System',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(
      `Swagger documentation available at http://localhost:${port}/api`,
    );
  });
}
bootstrap();
