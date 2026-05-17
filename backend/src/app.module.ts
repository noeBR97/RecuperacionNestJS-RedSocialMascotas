import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MascotasModule } from './mascotas/mascotas.module';

@Module({
  imports: [
    //módulo de configuración
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    UsuariosModule,
    AuthModule,
    MascotasModule,
  ],
})
export class AppModule {}