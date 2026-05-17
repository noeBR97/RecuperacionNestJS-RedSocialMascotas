import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeedModule);
    
    const seedService = app.get(SeedService);
    
    console.log('--- Iniciando Seeding ---');
    await seedService.ejecutarSeed();

    await app.close();
}

bootstrap();