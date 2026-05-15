import { Document, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema({ collection: 'mascotas', timestamps: true})
export class Mascota extends Document {
    @Prop({ required: true })
    nombre: string;

    @Prop({ type: Number })
    edad: number;

    @Prop({ required: true, enum: ['canino', 'felino', 'conejo', 'otro'] })
    especie: string;

    @Prop()
    raza: string;

    @Prop([String])
    fotos: string[];

    @Prop({ default: 0 })
    likes: number;

    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true})
    dueno: Types.ObjectId

    //subdocumento para los comentarios
    @Prop([{
        usuarioID: { type: Types.ObjectId, ref: 'Usuario'},
        texto: String,
        fecha: { type: Date, default: Date.now}
    }])
    comentarios: any[]
}

export const MascotaSchema = SchemaFactory.createForClass(Mascota)