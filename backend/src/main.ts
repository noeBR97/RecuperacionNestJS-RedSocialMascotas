import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import kleur from 'kleur';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:9080", "http://127.0.0.1:9080"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);

  console.log(
    kleur.green('🌐 ') +
    kleur.green().bold('Application is running on: ') +
    kleur.cyan(await app.getUrl())
  );
}
bootstrap();
