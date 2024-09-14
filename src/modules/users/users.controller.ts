import { Controller, Get, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TUser } from './user.model';
import {
  Action,
  IRequest,
  TResponse,
  getResponseType,
} from '../../common/helper/common-types';
import { QueryTypes } from '../../common/decorators/query.decorator';
import { checkAbilities } from '../../common/decorators/abilities.decorator';
import { AbilitiesGuard } from '../../common/guards/abilities.guard';
import { AccessTokenGuard } from '../../common/guards/jwt.guard';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(TUser) // this decorator helps us to resolve TUser class when used in getResponseType function
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse(getResponseType(TUser))
  @QueryTypes()
  // @UseGuards(AccessTokenGuard, AbilitiesGuard)
  // @checkAbilities({ action: Action.Read, subject: TUser })
  async findAll(@Req() req: IRequest): Promise<TResponse<TUser>> {
    return this.usersService.findAll(req);
  }

  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: TUser })
  @Get('me')
  getMe(@Req() req: IRequest): TUser {
    return req.user;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: TUser })
  findOne(@Param('id') id: string): Promise<TUser> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, AbilitiesGuard)
  @checkAbilities({ action: Action.Delete, subject: TUser })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
