import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // If roles are required but user is not present, deny access
    if (!user || !user.role) {
      console.warn(`Access denied: No user or role found in request for endpoint ${context.getHandler().name}`);
      return false;
    }

    // Role mapping for backward compatibility if needed, 
    // but primarily we should use the formal names.
    const userRole = user.role;
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      console.warn(`Access denied: User role '${userRole}' does not match required roles: ${requiredRoles.join(', ')}`);
    }

    return hasRole;
  }
}
