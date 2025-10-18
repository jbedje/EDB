import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // Security
  app.use(helmet());
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger Documentation - Disabled temporarily
  // const config = new DocumentBuilder()
  //   .setTitle('École de la Bourse API')
  //   .setDescription(
  //     'API de gestion des cohortes, du coaching et des abonnements',
  //   )
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document, {
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //   },
  // });

  await app.listen(port);

  console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║   🎓 École de la Bourse - API Backend                   ║
    ║                                                          ║
    ║   🚀 Server running on: http://localhost:${port}         ║
    ║   📚 API Documentation: http://localhost:${port}/api/docs║
    ║   🌍 Environment: ${configService.get('NODE_ENV')}                    ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
