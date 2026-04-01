import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activa validación automática en todos los endpoints usando los DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Permite peticiones desde el frontend Angular
  app.enableCors({ origin: 'http://localhost:4444' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}`);
}
bootstrap();
