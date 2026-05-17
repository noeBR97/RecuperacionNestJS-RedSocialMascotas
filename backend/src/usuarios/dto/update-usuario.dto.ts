import { IsString, IsInt, Min, IsPositive, IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    apellido1?: string;

    @IsString()
    @IsOptional()
    apellido2?: string;

    @IsInt()
    @Min(0)
    @IsPositive()
    @IsOptional()
    edad?: number;

    @IsString()
    @IsOptional()
    nombreUsuario?: string;

    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
    @IsOptional()
    clave?: string;

    @IsString()
    @IsOptional()
    rol?: string;
}