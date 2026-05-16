import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateComentarioDto {
    @IsString()
    @MinLength(1, { message: 'El comentario no puede estar vacío' })
    @MaxLength(500, { message: 'El comentario es demasiado largo' })
    texto: string;
}