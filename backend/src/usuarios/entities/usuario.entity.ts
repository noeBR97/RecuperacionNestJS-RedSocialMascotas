import { Document } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema({ collection: 'usuarios', timestamps: true})
export class Usuario extends Document {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    apellido1: string;

    @Prop({ required: false })
    apellido2: string;

    @Prop({ required: false })
    edad: number;

    @Prop({ required: true, unique: true })
    nombreUsuario: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    clave: string;

    @Prop({ required: true, enum: ['admin', 'usuario'], default: 'usuario' })
    rol: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.set('versionKey', false);