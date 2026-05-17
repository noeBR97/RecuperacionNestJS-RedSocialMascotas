import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.rol) {
            throw new ForbiddenException('No se han encontrado roles para este usuario')
        }

        const hasRol = requiredRoles.includes(user.rol)
        if(!hasRol) {
            throw new ForbiddenException(`Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`)
        }

        return true
    }
}