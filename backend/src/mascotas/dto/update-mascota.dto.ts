import { PartialType } from '@nestjs/mapped-types';
import { CreateMascotaDto } from './create-mascota.dto';

export class UpdateMascotaDto extends PartialType(CreateMascotaDto) {}
//utilizamos la libreria partialtype porque hereda los campos del create mascota dto, pero todos son opcionales