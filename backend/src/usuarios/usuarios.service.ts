import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    //inyectamos modelo de mongoose
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const {clave, ...datosUsuario} = createUsuarioDto
      const claveEncriptada = await bcrypt.hash(clave, 10)

      const nuevoUsuario = new this.usuarioModel({
        ...datosUsuario,
        clave: claveEncriptada
      })

      return await nuevoUsuario.save()
    } catch(error) {
      if (error.code === 11000) {
        throw new BadRequestException('El email o el nombre de usuario ya existen')
      }
      throw new InternalServerErrorException('Error al crear el usuario')
    }
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
