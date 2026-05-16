import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from 'src/auth/jwt.strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';

@Controller('mascotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body() createMascotaDto: CreateMascotaDto, @Req() req: any) {
    return this.mascotasService.create(createMascotaDto, req.user);
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
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateMascotaDto: UpdateMascotaDto) {
    return this.mascotasService.update(id, updateMascotaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.mascotasService.remove(id);
  }
}
