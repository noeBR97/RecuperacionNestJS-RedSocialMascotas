import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mascota } from './entities/mascota.entity';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';

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

  async update(id: string, updateMascotaDto: UpdateMascotaDto) {
    try {
      const mascotaActualizada = await this.mascotaModel.findByIdAndUpdate(id, updateMascotaDto, { new: true, runValidators: true})

      if(!mascotaActualizada) {
        throw new NotFoundException(`Mascota con ID ${id} no enocntrada`)
      }

      return mascotaActualizada
    } catch(error) {
      throw new InternalServerErrorException('Error al actualizar la mascota')
    }
  }

  async remove(id: string) {
    try {
      const mascotaEliminada = await this.mascotaModel.findByIdAndDelete(id)

      if(!mascotaEliminada) {
        throw new NotFoundException(`Mascota con ID ${id} no enocntrada`)
      }

      return { message: 'Mascota eliminada correctamente'}
    } catch(error) {
      throw new InternalServerErrorException('Error al eliminar la mascota')
    }
  }
}
