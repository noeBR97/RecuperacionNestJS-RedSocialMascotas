import { 
    IsString, 
    IsNotEmpty, 
    IsOptional, 
    IsNumber, 
    IsEmail, 
    MinLength, 
    IsEnum, 
    Min, 
    Max 
} from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido1: string;

    @IsString()
    @IsOptional()
    apellido2?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(120)
    edad?: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' })
    nombreUsuario: string;

    @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
    clave: string;

    @IsEnum(['admin', 'usuario'], { message: 'El rol debe ser admin o usuario' })
    rol?: string;
}