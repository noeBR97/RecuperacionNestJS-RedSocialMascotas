import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Email no válido'})
    email: string

    @IsNotEmpty()
    clave: string
}