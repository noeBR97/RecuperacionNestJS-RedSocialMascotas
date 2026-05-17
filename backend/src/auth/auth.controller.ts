import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usuariosService: UsuariosService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Post('registro')
    create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
    }
}
