import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Env, true>);

  if (configService.get('NODE_ENV', { infer: true }) !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API WAOK')
      .setDescription('REST API for hospital task management — NestJS · Prisma · PostgreSQL')
      .setVersion('1.0')
      .build();

    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(configService.get('PORT', { infer: true }));
}
bootstrap();
