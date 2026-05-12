import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usuariosService: UsuariosService, private jwtService: JwtService) {}

    async login(loginDto: LoginDto) {
        const { email, clave } = loginDto
        const usuario = await this.usuariosService.findByEmail(email)

        if (!usuario || !(await bcrypt.compare(clave, usuario.clave))) {
            throw new UnauthorizedException('Credenciales inválidas')
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        }

        return {
            token: this.jwtService.sign(payload),
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        }
    }
}
