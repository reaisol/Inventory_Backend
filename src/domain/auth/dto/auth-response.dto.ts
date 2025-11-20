import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
