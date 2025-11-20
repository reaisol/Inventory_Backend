import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
