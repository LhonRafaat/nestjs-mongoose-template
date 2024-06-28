import { ApiProperty } from '@nestjs/swagger';

export class TAuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
