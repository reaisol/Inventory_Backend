import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { getAllowedCorsOrigins, isSwaggerEnabled } from './config/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: getAllowedCorsOrigins(process.env),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  if (isSwaggerEnabled(process.env)) {
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
  }

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    if (isSwaggerEnabled(process.env)) {
      console.log(
        `Swagger documentation available at http://localhost:${port}/api`,
      );
    }
  });
}
bootstrap();
