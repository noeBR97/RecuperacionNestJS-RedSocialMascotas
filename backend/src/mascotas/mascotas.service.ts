import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mascota } from './entities/mascota.entity';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Injectable()
export class MascotasService {
  constructor(
      @InjectModel(Mascota.name)
      private readonly mascotaModel: Model<Mascota>
  ){}

  async create(createMascotaDto: CreateMascotaDto, usuario: any) {
    try {
      let duenoID = usuario.id

      if(usuario.rol === 'admin' && createMascotaDto.duenoID) {
        duenoID = createMascotaDto.duenoID
      }

      const nuevaMascota = await new this.mascotaModel({...createMascotaDto, dueno: duenoID})

      return await nuevaMascota.save()
    } catch(error) {
      throw new InternalServerErrorException('Error al registrar la mascota')
    }
  }

  async findAll() {
    try {
      return await this.mascotaModel.find().populate('dueno', '-clave')
    } catch(error) {
      throw new InternalServerErrorException('Error al obtener todas las mascotas')
    }
  }

  async findOne(id: string) {
    try {
      const mascota = await this.mascotaModel.findById(id).populate('dueno', '-clave')

      if(!mascota) {
        throw new NotFoundException(`Mascota con ID ${id} no enocntrada`)
      }

      return mascota
    } catch(error) {
      throw new InternalServerErrorException('Error al encontrar la mascota')
    }
  }

  async update(id: string, updateMascotaDto: UpdateMascotaDto, currentUser: any) {
    try {
      const mascota = await this.mascotaModel.findById(id)

      if(!mascota) {
        throw new NotFoundException(`Mascota con ID ${id} no enocntrada`)
      }

      if(currentUser.rol !== 'admin' && mascota.dueno.toString() !== currentUser.id) {
        throw new ForbiddenException('No tienes permiso para editar esta mascota')
      }

      const mascotaActualizada = await this.mascotaModel.findByIdAndUpdate(
        id, 
        updateMascotaDto, 
        { new: true, runValidators: true}
      )

      return mascotaActualizada
    } catch(error) {
      if(error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }

      throw new InternalServerErrorException('Error al actualizar la mascota')
    }
  }

  async remove(id: string, currentUser: any) {
    try {
      const mascota = await this.mascotaModel.findById(id)

      if(!mascota) {
        throw new NotFoundException(`Mascota con ID ${id} no enocntrada`)
      }

      if(currentUser.rol !== 'admin' && mascota.dueno.toString() !== currentUser.id) {
        throw new ForbiddenException('No tienes permiso para eliminar esta mascota')
      }

      await this.mascotaModel.findByIdAndDelete(id)

      return { message: 'Mascota eliminada correctamente'}
    } catch(error) {
      if(error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }

      throw new InternalServerErrorException('Error al eliminar la mascota')
    }
  }

  async createComentario(mascotaID: string, createComentarioDto: CreateComentarioDto, usuarioID: string) {
    try {
      const comentarioMascota = await this.mascotaModel.findByIdAndUpdate(
        mascotaID,
        { $push: {
          comentarios: {
            usuarioID: usuarioID,
            texto: createComentarioDto.texto,
            fecha: new Date()
          }
        }},
        { new: true }
      ).populate('comentarios.usuarioID', 'nombre')

      if(!comentarioMascota) {
        throw new NotFoundException('Mascota no encontrada')
      }

      return comentarioMascota.comentarios
    } catch(error) {
      throw new InternalServerErrorException('Error al crear el comentario')
    }
  }

  async removeComentario(mascotaID: string, comentarioID: string) {
    try {
      const mascota = await this.mascotaModel.findByIdAndUpdate(
        mascotaID,
        { $pull: { comentarios: { _id: comentarioID }}},
        { new: true }
      )

      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada')
      }

      return { message: 'Comentario eliminado correctamente', mascota}
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el comentario')
    }
  }

  async getComentarios(mascotaID: string) {
    try {
      const mascota = await this.mascotaModel.findById(mascotaID).select('comentarios').populate('comentarios.usuarioID', 'nombre email')

      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada')
      }

      return mascota.comentarios
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los comentarios')
    }
  }

  async darLike(mascotaID: string, usuarioID: string) {
    const mascota = await this.mascotaModel.findById(mascotaID)

    if(!mascota) {
      throw new NotFoundException('Mascota no encontrada')
    }

    const likesActuales = mascota.likes || []

    if(likesActuales.includes(usuarioID)) {
      throw new BadRequestException('Ya has dado like a esta mascota')
    }

    return await this.mascotaModel.findByIdAndUpdate(
      mascotaID,
      { $addToSet: { likes: usuarioID }}, //mejor que $push. garantiza que el id no se guarde dos veces por error
      { new: true }
    )
  }

  async getRecuentoLikesMascota(mascotaID: string) {
    try {
      const mascota = await this.mascotaModel.findById(mascotaID)

      if(!mascota) {
        throw new NotFoundException('Mascota no encontrada')
      }

      return {
        mascotaID: mascotaID,
        totalLikes: mascota.likes ? mascota.likes.length : 0
      }
    } catch(error) {
      throw new InternalServerErrorException('Error al obtener los likes')
    }
  }
}
