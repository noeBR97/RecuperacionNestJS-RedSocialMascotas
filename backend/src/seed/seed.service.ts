import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Mascota } from '../mascotas/entities/mascota.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
        @InjectModel(Mascota.name) private mascotaModel: Model<Mascota>
    ){}

    async ejecutarSeed() {
        try {
            //borramos la bbdd primero
            await this.usuarioModel.deleteMany({})
            await this.mascotaModel.deleteMany({})

            console.log('Base de Datos limpia')

            //creacion de usuarios
            const claveHash = await bcrypt.hash('clave123', 10)

            const usuarios = await this.usuarioModel.insertMany([
                {
                    //usuario admin
                    nombre: 'Administrador',
                    apellido1: 'de Prueba',
                    nombreUsuario: 'administrador01',
                    email: 'admin@admin.com',
                    clave: claveHash,
                    rol: 'admin'
                },
                {
                    //usuarios normales
                    nombre: 'Usuario de Prueba',
                    apellido1: 'Estándar',
                    nombreUsuario: 'userEstándar01',
                    email: 'user@app.com',
                    clave: claveHash,
                    rol: 'usuario'
                },
                {
                    nombre: 'Usuario de Prueba 2',
                    apellido1: 'Estándar',
                    nombreUsuario: 'userEstándar02',
                    email: 'user2@app.com',
                    clave: claveHash,
                    rol: 'usuario'
                }
            ])

            console.log('USUARIOS CREADOS')

            //creacion de mascotas
            const adminID = usuarios[0]._id
            const userID = usuarios[1]._id
            const user2ID = usuarios[2]._id

            await this.mascotaModel.insertMany([
                {
                    nombre: 'Rex',
                    especie: 'Perro',
                    raza: 'Pastor Alemán',
                    edad: 4,
                    dueno: adminID,
                    likes: [user2ID]
                },
                {
                    nombre: 'Michi',
                    especie: 'Gato',
                    raza: 'Siamés',
                    edad: 2,
                    dueno: userID,
                    likes: [adminID, user2ID]
                },
                {
                    nombre: 'Copito',
                    especie: 'Conejo',
                    raza: 'Enano',
                    edad: 1,
                    dueno: user2ID,
                    likes: []
                }
            ])

            console.log('MASCOTAS CREADAS Y VINCULADAS')

            return 'Seed completado con éxito'
        } catch(error) {
            console.log('Error en el seed: ', error)
            throw error
        }
    }
}