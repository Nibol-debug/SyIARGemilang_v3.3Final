import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    return { 
      sub: payload.sub,
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role,
      role_id: payload.role_id,
      studentId: payload.studentId,
      employeeId: payload.employeeId,
      permissions: payload.permissions || []
    };
  }
}
