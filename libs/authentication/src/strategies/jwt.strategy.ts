import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONSTANTS } from '../constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CurrentUser } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      roles: payload?.roles,
    };
  }
}
