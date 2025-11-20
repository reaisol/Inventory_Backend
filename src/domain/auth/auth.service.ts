/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthenticationService } from '@app/authentication';
import { User } from '@app/database/entities/user.entity';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.authenticationService.validateUser(
      loginDto.email,
      loginDto.password,
      this.userRepository,
    );

    const tokens = await this.authenticationService.generateTokens(user);

    // Remove roles from user
    const { roles: _, ...userWithoutRoles } = user;
    return {
      ...tokens,
      user: userWithoutRoles,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.authenticationService.verifyToken(
        refreshTokenDto.refreshToken,
      );

      if (decoded.tokenType !== 'refresh') {
        throw new BadRequestException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(decoded.sub);
      const tokens = await this.authenticationService.generateTokens(user);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
