import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthRegisterPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oauthProvider: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oauthProviderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  avatar: string;
}
