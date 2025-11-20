/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JWT_CONSTANTS } from './constants';

@Injectable()
export class AuthenticationService {
  constructor(private jwtService: JwtService) {}

  async validateUser(
    email: string,
    password: string,
    userRepository: any,
  ): Promise<any> {
    const user = await userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from returned user object and also roles
    const { password: _, ...result } = user;
    return result;
  }

  async generateTokens(user: any) {
    // Extract permissions from roles
    const permissions = user?.roles
      .flatMap((role) => role?.permissions)
      .map((permission) => permission?.name)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    const payload: JwtPayload = {
      sub: user?.id,
      name: user?.name,
      email: user?.email,
      roles: user?.roles?.map((role) => role?.id),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(
        { ...payload, tokenType: 'refresh' } as JwtPayload,
        { expiresIn: JWT_CONSTANTS.refreshExpiresIn } as JwtSignOptions,
      ),
    };
  }

  async generateSystemToken(systemId: string, permissions: string[] = []) {
    const payload = {
      sub: systemId,
      permissions,
    };

    return this.jwtService.sign(payload);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt();
    return bcryptjs.hash(password, salt);
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
