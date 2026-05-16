import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    } catch(error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('El email o el nombre de usuario ya existen')
      }
      throw new InternalServerErrorException('Error al crear el usuario')
    }
  }

  async findByEmail(email: string) {
    return await this.usuarioModel.findOne({email})
  }

  async findAll() {
    try {
      return await this.usuarioModel.find().select('-clave'); //eliminamos la clave en la respuesta por seguridad
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: string, currentUser: any) {
    if(currentUser.rol !== 'admin' && currentUser.id !== id) {
        throw new ForbiddenException('No tienes permiso para ver este perfil')
    }

    try {
      const usuario = await this.usuarioModel.findById(id).select('-clave');

        if (!usuario) {
          throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return usuario;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
    
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, currentUser: any) {
    //solo el admin o el propio usuario pueden acceder
    if(currentUser.rol !== 'admin' && currentUser.id !== id) {
        throw new ForbiddenException('No tienes permiso para editar este perfil')
    }

    //proteccion de rol. Si no es admin, eliminamos cualquier intento de cambio de rol
    if(currentUser.rol !== 'admin' && updateUsuarioDto.rol) {
      delete updateUsuarioDto.rol
    }

    try {
      //si el usuario quiere cambiar la clave la encriptamos
      if(updateUsuarioDto.clave) {
        updateUsuarioDto.clave = await bcrypt.hash(updateUsuarioDto.clave, 10)
      }

      const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(
        id,
        updateUsuarioDto,
        { new: true, runValidators: true}
      ).select('-clave')

      if(!usuarioActualizado) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`)
      }

      return usuarioActualizado
    } catch(error) {
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: string) {
    try {
      const usuarioEliminado = await this.usuarioModel.findByIdAndDelete(id);

      if (!usuarioEliminado) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch(error) {
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async findMiPerfil(id: string) {
    try {
      const usuario = await this.usuarioModel.findById(id).select('-clave')

      if(!usuario) {
        throw new NotFoundException('Perfil no encontrado')
      }

      return usuario
    } catch(error) {
      throw new InternalServerErrorException('Error al obtener el perfil')
    }
  }
}
