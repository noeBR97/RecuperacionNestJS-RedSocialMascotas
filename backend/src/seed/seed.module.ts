import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';
import { Mascota, MascotaSchema } from '../mascotas/entities/mascota.entity';

@Module({
    imports: [
        ConfigModule.forRoot(), 
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/RedSocialMascotas'),
        MongooseModule.forFeature([
        { name: Usuario.name, schema: UsuarioSchema },
        { name: Mascota.name, schema: MascotaSchema },
        ]),
    ],
    providers: [SeedService],
    })
export class SeedModule {}