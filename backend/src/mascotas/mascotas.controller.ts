import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from 'src/auth/jwt.strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('mascotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body() createMascotaDto: CreateMascotaDto, @Req() req: any) {
    return this.mascotasService.create(createMascotaDto, req.user);
  }

  @Get('ranking/global')
  @Roles('admin', 'usuario')
  async getRanking() {
    return this.mascotasService.getRankingGlobal()
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.mascotasService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.mascotasService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'usuario')
  update(@Param('id') id: string, @Body() updateMascotaDto: UpdateMascotaDto, @Req() req: any) {
    return this.mascotasService.update(id, updateMascotaDto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.mascotasService.remove(id, req.user);
  }

  @Post(':id/comentarios')
  @Roles('admin', 'usuario')
  addComentario(
    @Param('id') id: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @Req() req: any
  ) {
    return this.mascotasService.createComentario(id, createComentarioDto, req.user.id)
  }

  @Get(':id/comentarios')
  @Roles('admin')
  findComentarios(@Param('id') id: string) {
    return this.mascotasService.getComentarios(id)
  }

  @Delete(':mascotaID/comentarios/:comentarioID')
  @Roles('admin')
  removeComentario(
    @Param('mascotaID') mascotaID: string,
    @Param('comentarioID') comentarioID: string
  ) {
    return this.mascotasService.removeComentario(mascotaID, comentarioID);
  }

  @Put(':id/like')
  @Roles('admin', 'usuario')
  async darLike(@Param('id') id: string, @Req() req: any) {
    return this.mascotasService.darLike(id, req.user.id)
  }

  @Get(':id/likes/count')
  @Roles('admin', 'usuario')
  async getRecuentoLikes(@Param('id') id: string) {
    return this.mascotasService.getRecuentoLikesMascota(id)
  }

  @Put(':id/upload')
  @Roles('admin', 'usuario')
  @UseInterceptors(FileInterceptor('file'))
  async subirImagen(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if(!file) {
      throw new BadRequestException('No se ha seleccionado ninguna imagen')
    }

    return this.mascotasService.subirFotoMascota(id, file, req.user)
  }
}
