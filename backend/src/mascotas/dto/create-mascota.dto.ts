import { IsArray, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateMascotaDto {
    @IsString()
    @MinLength(3)
    nombre: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    edad?: number;

    @IsString()
    @MinLength(3, { message: 'La especie es obligatoria y debe ser descriptiva' })
    especie: string;

    @IsString()
    @IsOptional()
    raza?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    fotos?: string[];
}
