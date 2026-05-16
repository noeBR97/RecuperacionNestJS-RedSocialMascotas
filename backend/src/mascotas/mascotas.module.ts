import { Module } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { MascotasController } from './mascotas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Mascota, MascotaSchema } from './entities/mascota.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mascota.name, schema: MascotaSchema }
    ])
  ],
  controllers: [MascotasController],
  providers: [MascotasService],
  exports: [MascotasService]
})
export class MascotasModule {}
